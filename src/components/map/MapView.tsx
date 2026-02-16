import { Layer, Map, Source } from 'react-map-gl/maplibre';
import { Box } from '@mui/joy';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightPosition } from '../../hooks/useFlightPosition.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Feature } from 'geojson';
import { getPlaneImageData } from './PlaneIcon.ts';
import { MapRef } from 'react-map-gl/mapbox-legacy';
import MapControls from './MapControls.tsx';

export default function MapView() {
  const position = useFlightPosition();
  const mapRef = useRef<MapRef>(null);
  const planeColor = '#0080FF'; // Change this to customize plane icon color
  const [isFollowing, setIsFollowing] = useState(true);
  const [viewState, setViewState] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 4,
  });

  // Update view to follow plane when position changes (only if following is enabled)
  useEffect(() => {
    if (position && isFollowing) {
      setViewState((prev) => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
      }));
    }
  }, [position?.latitude, position?.longitude, isFollowing]);

  const geojson: GeoJSON.GeoJSON = useMemo(() => {
    let features: Array<Feature> = [];
    if (position) {
      features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [position.longitude, position.latitude],
          },
          properties: {
            heading: position.heading,
            altitude: position.altitude,
            airspeed: position.airspeed,
          },
        },
      ];
    }

    return {
      type: 'FeatureCollection' as const,
      features: features,
    };
  }, [position]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef as any}
        mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={(e) => {
          const map = e.target;

          const dataUrl = getPlaneImageData(planeColor);
          const image = new Image();
          image.onload = () => {
            map.addImage('plane', image);
          };
          image.src = dataUrl;
        }}
      >
        <Source id='flight-position' type='geojson' data={geojson}>
          <Layer
            id='plane-icon'
            type='symbol'
            filter={['==', ['geometry-type'], 'Point']}
            layout={{
              'icon-image': 'plane',
              'icon-size': 1.5,
              'icon-rotate': ['get', 'heading'],
              'icon-rotation-alignment': 'map',
              'icon-allow-overlap': true,
            }}
            paint={{
              'icon-opacity': position ? 1 : 0,
            }}
          />
        </Source>
      </Map>
      <MapControls isFollowing={isFollowing} onFollowToggle={setIsFollowing} />
    </Box>
  );
}
