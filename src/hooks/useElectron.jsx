import { useState, useEffect } from 'react';

const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isElectronApp = userAgent.indexOf('electron') !== -1;
    setIsElectron(isElectronApp);

    // Add class to body for CSS targeting
    if (isElectronApp) {
      document.body.classList.add('electron-app');
    } else {
      document.body.classList.add('web-app');
    }

    return () => {
      document.body.classList.remove('electron-app', 'web-app');
    };
  }, []);

  // Window management functions
  const windowControls = {
    minimize: () => {
      if (window.electronAPI?.minimize) {
        window.electronAPI.minimize();
      }
    },

    maximize: () => {
      if (window.electronAPI?.maximize) {
        window.electronAPI.maximize();
      }
    },

    restore: () => {
      if (window.electronAPI?.restore) {
        window.electronAPI.restore();
      }
    },

    close: () => {
      if (window.electronAPI?.close) {
        window.electronAPI.close();
      }
    },

    toggleFullscreen: () => {
      if (window.electronAPI?.toggleFullscreen) {
        window.electronAPI.toggleFullscreen();
      }
    },

    isMaximized: async () => {
      if (window.electronAPI?.isMaximized) {
        return await window.electronAPI.isMaximized();
      }
      return false;
    },

    isFullscreen: async () => {
      if (window.electronAPI?.isFullscreen) {
        return await window.electronAPI.isFullscreen();
      }
      return false;
    }
  };

  return { isElectron, windowControls };
};

export default useElectron;