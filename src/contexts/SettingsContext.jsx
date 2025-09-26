import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants.js';

// Initial state from constants
const initialState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null
};

// Action types
const SETTINGS_ACTIONS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer
const settingsReducer = (state, action) => {
  switch (action.type) {
    case SETTINGS_ACTIONS.LOAD_SETTINGS:
      return {
        ...state,
        settings: { ...DEFAULT_SETTINGS, ...action.payload },
        isLoading: false,
        error: null
      };

    case SETTINGS_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case SETTINGS_ACTIONS.RESET_SETTINGS:
      return {
        ...state,
        settings: DEFAULT_SETTINGS
      };

    case SETTINGS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case SETTINGS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

// Create context
const SettingsContext = createContext();

// Settings provider component
export const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        dispatch({ type: SETTINGS_ACTIONS.SET_LOADING, payload: true });

        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          dispatch({
            type: SETTINGS_ACTIONS.LOAD_SETTINGS,
            payload: parsedSettings
          });
        } else {
          dispatch({
            type: SETTINGS_ACTIONS.LOAD_SETTINGS,
            payload: DEFAULT_SETTINGS
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        dispatch({
          type: SETTINGS_ACTIONS.SET_ERROR,
          payload: 'Failed to load settings'
        });
        dispatch({
          type: SETTINGS_ACTIONS.LOAD_SETTINGS,
          payload: DEFAULT_SETTINGS
        });
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading && !state.error) {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
        dispatch({
          type: SETTINGS_ACTIONS.SET_ERROR,
          payload: 'Failed to save settings'
        });
      }
    }
  }, [state.settings, state.isLoading, state.error]);

  // Update settings
  const updateSettings = (newSettings) => {
    dispatch({
      type: SETTINGS_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings
    });
  };

  // Reset settings to defaults
  const resetSettings = () => {
    dispatch({ type: SETTINGS_ACTIONS.RESET_SETTINGS });
  };

  // Get specific setting value
  const getSetting = (path) => {
    const keys = path.split('.');
    let value = state.settings;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  };

  // Update specific setting value
  const updateSetting = (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = { ...state.settings };
    let target = current;

    // Navigate to the parent object
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    // Set the value
    target[lastKey] = value;

    dispatch({
      type: SETTINGS_ACTIONS.UPDATE_SETTINGS,
      payload: current
    });
  };

  // Export settings
  const exportSettings = () => {
    try {
      const exportData = {
        settings: state.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw new Error('Failed to export settings');
    }
  };

  // Import settings
  const importSettings = (settingsJson) => {
    try {
      const importData = JSON.parse(settingsJson);

      if (!importData.settings) {
        throw new Error('Invalid settings format');
      }

      // Merge with default settings to ensure all required fields exist
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...importData.settings
      };

      dispatch({
        type: SETTINGS_ACTIONS.UPDATE_SETTINGS,
        payload: mergedSettings
      });

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Failed to import settings: ' + error.message);
    }
  };

  // Apply settings to DOM (for CSS custom properties)
  useEffect(() => {
    const applySettingsToDOM = () => {
      const root = document.documentElement;

      // Apply appearance settings
      if (state.settings.appearance?.fontSize) {
        root.style.setProperty('--font-size-ui-base', `${state.settings.appearance.fontSize}px`);
      }

      if (state.settings.editor?.fontSize) {
        root.style.setProperty('--font-size-editor-base', `${state.settings.editor.fontSize}px`);
      }

      if (state.settings.editor?.lineHeight) {
        root.style.setProperty('--line-height-editor', state.settings.editor.lineHeight);
      }

      if (state.settings.editor?.fontFamily && state.settings.editor.fontFamily !== 'default') {
        let fontFamily;
        switch (state.settings.editor.fontFamily) {
          case 'serif':
            fontFamily = 'Georgia, "Times New Roman", serif';
            break;
          case 'monospace':
            fontFamily = 'Monaco, "Cascadia Code", "Roboto Mono", monospace';
            break;
          case 'system':
            fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            break;
          default:
            fontFamily = 'inherit';
        }
        root.style.setProperty('--font-family-editor', fontFamily);
      }
    };

    if (!state.isLoading) {
      applySettingsToDOM();
    }
  }, [state.settings, state.isLoading]);

  // Context value
  const contextValue = {
    // State
    settings: state.settings,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    updateSettings,
    resetSettings,
    getSetting,
    updateSetting,
    exportSettings,
    importSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;