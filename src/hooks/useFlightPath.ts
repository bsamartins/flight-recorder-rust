import { useMemo } from 'react';
import { useGetFlightData } from './useGetFlightData.ts';

export interface PathPoint {
  longitude: number;
  latitude: number;
  altitude: number;
  timestamp: number;
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
export function useFlightPath(
  selectedFlightId: string,
  options?: { enabled?: boolean },
): PathPoint[] | undefined {
  const { data = [] } = useGetFlightData(selectedFlightId, {
    enabled: options?.enabled,
    refetchInterval: 1000,
  });
  return useMemo(() => {
    if (!options?.enabled) return undefined;
    return data.map((d) => ({
      longitude: d.longitude,
      latitude: d.latitude,
      altitude: d.altitude,
      timestamp: new Date(d.timestamp).getTime(),
    }));
  }, [options?.enabled, data]);
}

/**
 * Converts path history to GeoJSON LineString segments with altitude-based colors
 */
export function pathToGeoJSON(pathPoints: PathPoint[]) {
  const features = [];

  // Need at least 2 points to draw a line
  if (pathPoints.length < 2) {
    return {
      type: 'FeatureCollection' as const,
      features: [],
    };
  }

  // Create one LineString segment per pair of consecutive points
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const point1 = pathPoints[i];
    const point2 = pathPoints[i + 1];

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
