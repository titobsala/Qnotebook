import React from 'react';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import { EditorProvider } from './contexts/EditorContext.jsx';

// Layout Components
import AppLayout from './components/Layout/AppLayout.jsx';
import EditorContainer from './components/Editor/EditorContainer.jsx';

// Hooks
import useElectron from './hooks/useElectron.jsx';

// Global Styles
import './styles/globals.css';
import './styles/themes.css';

function App() {
  // Detect Electron environment and add body class
  useElectron();

  return (
    <ThemeProvider>
      <SettingsProvider>
        <EditorProvider>
          <AppLayout>
            <EditorContainer />
          </AppLayout>
        </EditorProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
