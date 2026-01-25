import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/inter';
import { ThemeProvider } from '@mui/material';
import theme from './theme.tsx';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import * as React from 'react';
import { SnackbarProvider } from 'notistack';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssVarsProvider>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <App />
          </SnackbarProvider>
        </CssVarsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
