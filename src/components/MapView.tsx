import { Map } from 'react-map-gl/maplibre';
import { Box } from '@mui/joy';

export default function MapView() {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Map
        mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        initialViewState={{
          latitude: 37.8,
          longitude: -122.4,
          zoom: 10,
        }}
      />
    </Box>
  );
}
