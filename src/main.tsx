import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/inter';
import {ThemeProvider} from "@mui/material";
import theme from "./theme.tsx";
import {CssBaseline, CssVarsProvider} from "@mui/joy";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
          <CssVarsProvider>
              <CssBaseline enableColorScheme />
              <App />
          </CssVarsProvider>
      </ThemeProvider>
  </React.StrictMode>,
);
