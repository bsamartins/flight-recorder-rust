import { useEffect, useRef, useState } from 'react';
import { usePlanePosition } from './usePlanePosition.ts';
import { getFlightData } from '../commands';

export interface PathPoint {
  longitude: number;
  latitude: number;
  altitude: number;
  timestamp: number;
}

export interface PathHistory {
  points: PathPoint[];
}

/**
 * Converts altitude to HSL color: yellow (0 ft) → green → blue → purple (40,000+ ft)
 * Uses fixed altitude range: 0 feet = yellow, 40,000 feet = purple
 * Uses HSL color space for smooth, perceptually uniform gradients
 */
function getAltitudeColor(altitude: number): string {
  const MIN_ALTITUDE = 0;
  const MAX_ALTITUDE = 40000;

  // Clamp altitude to range [0, 40000]
  const clampedAltitude = Math.max(MIN_ALTITUDE, Math.min(MAX_ALTITUDE, altitude));

  // Normalize to 0-1 range
  const normalized = (clampedAltitude - MIN_ALTITUDE) / (MAX_ALTITUDE - MIN_ALTITUDE);

  // HSL hue: 60° (yellow) → 120° (green) → 240° (blue) → 270° (purple)
  // normalized 0 = 60° (yellow), 1 = 270° (purple)
  const hue = 60 + normalized * 210;

  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Manages flight path history with altitude-based coloring
 * Returns the current path as a GeoJSON FeatureCollection
 * Supports both live flight data and recorded flight history
 */
export function useFlightPath(selectedFlightId?: string) {
  const position = usePlanePosition();
  const pathBufferRef = useRef<PathPoint[]>([]);
  const [renderedPath, setRenderedPath] = useState<PathHistory>({
    points: [],
  });
  const lastUpdateRef = useRef<number>(0);
  const lastFlightActiveRef = useRef<boolean>(false);

  // Load recorded flight data when a flight is selected
  useEffect(() => {
    if (!selectedFlightId) {
      return;
    }

    const loadFlightData = async () => {
      try {
        const data = await getFlightData(selectedFlightId);
        const points: PathPoint[] = data.map((d) => ({
          longitude: d.longitude,
          latitude: d.latitude,
          altitude: d.altitude,
          timestamp: new Date(d.timestamp).getTime(),
        }));

        pathBufferRef.current = points;
        setRenderedPath({ points });
      } catch (error) {
        console.error('Failed to load flight data:', error);
      }
    };

    void loadFlightData();
  }, [selectedFlightId]);

  // Handle live flight data when no flight is selected
  useEffect(() => {
    if (selectedFlightId) {
      // When a flight is selected, don't track live position
      return;
    }

    const isFlightActive = position !== null;

    // Clear path if flight just ended
    if (lastFlightActiveRef.current && !isFlightActive) {
      pathBufferRef.current = [];
      setRenderedPath({
        points: [],
      });
      lastFlightActiveRef.current = false;
      return;
    }

    // Clear path if new flight started (detect transition from null → not null)
    if (!lastFlightActiveRef.current && isFlightActive) {
      pathBufferRef.current = [];
      lastUpdateRef.current = 0;
      lastFlightActiveRef.current = true;
    }

    if (!position) {
      return;
    }

    // Add new point to buffer
    const newPoint: PathPoint = {
      longitude: position.longitude,
      latitude: position.latitude,
      altitude: position.altitude,
      timestamp: Date.now(),
    };
    pathBufferRef.current.push(newPoint);

    // Implement sliding window: keep only last 10,000 points
    const MAX_POINTS = 10000;
    if (pathBufferRef.current.length > MAX_POINTS) {
      // Remove oldest 10% of points
      const pointsToRemove = Math.floor(MAX_POINTS * 0.1);
      pathBufferRef.current = pathBufferRef.current.slice(pointsToRemove);
    }

    // Throttle update: every 500ms or every 5 new points
    const now = Date.now();
    const timeSinceUpdate = now - lastUpdateRef.current;
    const newPointsSinceRender = pathBufferRef.current.length - renderedPath.points.length;

    if (timeSinceUpdate > 500 || newPointsSinceRender >= 5) {
      const points = [...pathBufferRef.current];

      if (points.length > 0) {
        setRenderedPath({
          points,
        });
      }

      lastUpdateRef.current = now;
    }
  }, [position, selectedFlightId]);

  return renderedPath;
}

/**
 * Converts path history to GeoJSON LineString segments with altitude-based colors
 */
export function pathToGeoJSON(path: PathHistory) {
  const features = [];

  // Need at least 2 points to draw a line
  if (path.points.length < 2) {
    return {
      type: 'FeatureCollection' as const,
      features: [],
    };
  }

  // Create one LineString segment per pair of consecutive points
  for (let i = 0; i < path.points.length - 1; i++) {
    const point1 = path.points[i];
    const point2 = path.points[i + 1];

    // Use average altitude for segment color
    const avgAltitude = (point1.altitude + point2.altitude) / 2;
    const color = getAltitudeColor(avgAltitude);

    features.push({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [point1.longitude, point1.latitude],
          [point2.longitude, point2.latitude],
        ],
      },
      properties: {
        color,
      },
    });
  }

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}
