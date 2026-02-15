import { Map } from 'react-map-gl/maplibre';
import { Box } from '@mui/joy';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView() {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Map
        mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        initialViewState={{
          latitude: 0,
          longitude: 0,
          zoom: 0,
        }}
      />
    </Box>
  );
}
