import { Box } from '@mui/joy';
import SideBar from './components/SideBar';
import Header from './components/Header.tsx';
import MyFlights from './components/MyFlights.tsx';
import MapView from './components/MapView.tsx';
import { useFlightEndedEvent } from './hooks/useFlightEndedEvent.ts';

function App() {
  useFlightEndedEvent();

  return (
    <Box sx={{ height: '100dvh' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <MapView />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <Header />
        <Box sx={{ display: 'flex' }}>
          <SideBar />
          <Box component='main' className='MainContent' sx={{ flex: 1 }}>
            <MyFlights />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
