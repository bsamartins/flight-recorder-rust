import { Box } from '@mui/joy';
import SideBar from './components/SideBar';
import Header from './components/Header.tsx';
import MyFlights from './components/MyFlights.tsx';
import { useFlightEndedEvent } from './hooks/useFlightEndedEvent.ts';
import MapView from './components/map/MapView.tsx';

function App() {
  useFlightEndedEvent();

  return (
    <Box
      sx={{
        height: '100dvh',
        width: '100dvw',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <MapView />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          width: '100vw',
        }}
      >
        <Header />
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <SideBar />
          <Box
            component='main'
            className='MainContent'
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <MyFlights />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
