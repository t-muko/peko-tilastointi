import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import './index.css';
import './App.css';

import rootStore from '@stores';

import App from '@components/App';
import { FirebaseContext } from '@components/Firebase/Firebase';

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [manualMode, setManualMode] = React.useState<'light' | 'dark' | null>(null);

  const mode = manualMode ?? (prefersDarkMode ? 'dark' : 'light');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode
        }
      }),
    [mode]
  );

  const toggleMode = React.useCallback(() => {
    setManualMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
        <IconButton
          aria-label="toggle color mode"
          onClick={toggleMode}
          size="small"
          sx={{
            position: 'fixed',
            top: 6,
            left: 6,
            zIndex: (muiTheme) => muiTheme.zIndex.tooltip + 1,
            width: 24,
            height: 24
          }}
        >
          {mode === 'dark' ? <LightModeIcon fontSize="inherit" /> : <DarkModeIcon fontSize="inherit" />}
        </IconButton>
      </Tooltip>
      {children}
    </ThemeProvider>
  );
}

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  (window as any).__rootStore = rootStore;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <FirebaseContext.Provider value={{ rootStore: rootStore }}>
        <App />
      </FirebaseContext.Provider>
    </AppThemeProvider>
  </React.StrictMode>
);
