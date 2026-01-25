import { Box } from '@mui/joy';
import SideBar from './components/SideBar';
import Header from './components/Header.tsx';
import MyFlights from './components/MyFlights.tsx';
import { useFlightEndedEvent } from './hooks/useFlightEndedEvent.ts';

function App() {
  useFlightEndedEvent();

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <Header />
        <Box sx={{ display: 'flex' }}>
          <SideBar />
          <Box component='main' className='MainContent' sx={{ flex: 1 }}>
            <MyFlights />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
