import { Map } from 'react-map-gl/maplibre';

export default function MapView() {
  return (
    <Map
      mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      initialViewState={{
        latitude: 0,
        longitude: 0,
        zoom: 3,
      }}
    />
  );
}
