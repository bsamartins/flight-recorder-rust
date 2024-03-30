import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {Box} from "@mui/joy";
import SideBar from "./components/SideBar";
import Header from "./components/Header.tsx";
import MyMessages from "./components/MyMessages.tsx";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
      <>
          <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
              <SideBar/>
              <Header />
              <Box component="main" className="MainContent" sx={{ flex: 1 }}>
                  <MyMessages/>
                  {/*<h1>Welcome to Tauri!</h1>*/}

                  {/*<p>Click on the Tauri, Vite, and React logos to learn more.</p>*/}

                  {/*<form*/}
                  {/*    className="row"*/}
                  {/*    onSubmit={(e) => {*/}
                  {/*        e.preventDefault();*/}
                  {/*        greet();*/}
                  {/*    }}*/}
                  {/*>*/}
                  {/*    <input*/}
                  {/*        id="greet-input"*/}
                  {/*        onChange={(e) => setName(e.currentTarget.value)}*/}
                  {/*        placeholder="Enter a name..."*/}
                  {/*    />*/}
                  {/*    <button type="submit">Greet</button>*/}
                  {/*</form>*/}

                  {/*<p>{greetMsg}</p>*/}
              </Box>
          </Box>
      </>
  );
}

export default App;
