import {Box} from "@mui/joy";
import SideBar from "./components/SideBar";
import Header from "./components/Header.tsx";
import MyFlights from "./components/MyFlights.tsx";

function App() {
  return (
      <>
          <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
              <SideBar/>
              <Header />
              <Box component="main" className="MainContent" sx={{ flex: 1 }}>
                  <MyFlights/>
              </Box>
          </Box>
      </>
  );
}

export default App;
