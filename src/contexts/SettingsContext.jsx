import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEYS, VALIDATION } from '../utils/constants.js';

// Initial state from constants
const initialState = {
  ...DEFAULT_SETTINGS,
  isLoaded: false,
  hasUnsavedChanges: false
};

// Action types
const SETTINGS_ACTIONS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  UPDATE_SETTING: 'UPDATE_SETTING',
  UPDATE_NESTED_SETTING: 'UPDATE_NESTED_SETTING',
  RESET_SETTINGS: 'RESET_SETTINGS',
  RESET_SECTION: 'RESET_SECTION',
  MARK_SAVED: 'MARK_SAVED',
  MARK_UNSAVED: 'MARK_UNSAVED'
};

// Settings reducer
const settingsReducer = (state, action) => {
  switch (action.type) {
    case SETTINGS_ACTIONS.LOAD_SETTINGS:
      return {
        ...state,
        ...action.payload,
        isLoaded: true,
        hasUnsavedChanges: false
      };

    case SETTINGS_ACTIONS.UPDATE_SETTING:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        hasUnsavedChanges: true
      };

    case SETTINGS_ACTIONS.UPDATE_NESTED_SETTING:
      const { section, key, value } = action.payload;
      return {
        ...state,
        [section]: {
          ...state[section],
          [key]: value
        },
        hasUnsavedChanges: true
      };

    case SETTINGS_ACTIONS.RESET_SETTINGS:
      return {
        ...DEFAULT_SETTINGS,
        isLoaded: true,
        hasUnsavedChanges: true
      };

    case SETTINGS_ACTIONS.RESET_SECTION:
      return {
        ...state,
        [action.payload]: DEFAULT_SETTINGS[action.payload],
        hasUnsavedChanges: true
      };

    case SETTINGS_ACTIONS.MARK_SAVED:
      return {
        ...state,
        hasUnsavedChanges: false
      };

    case SETTINGS_ACTIONS.MARK_UNSAVED:
      return {
        ...state,
        hasUnsavedChanges: true
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
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);

          // Merge with default settings to ensure all properties exist
          const mergedSettings = mergeWithDefaults(parsedSettings, DEFAULT_SETTINGS);

          dispatch({
            type: SETTINGS_ACTIONS.LOAD_SETTINGS,
            payload: mergedSettings
          });
        } else {
          // No saved settings, use defaults
          dispatch({
            type: SETTINGS_ACTIONS.LOAD_SETTINGS,
            payload: DEFAULT_SETTINGS
          });
        }
      } catch (error) {
        console.warn('Failed to load settings, using defaults:', error);
        dispatch({
          type: SETTINGS_ACTIONS.LOAD_SETTINGS,
          payload: DEFAULT_SETTINGS
        });
      }
    };

    loadSettings();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (!state.isLoaded || !state.hasUnsavedChanges) return;

    const saveTimer = setTimeout(() => {
      saveSettings();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimer);
  }, [state]);

  // Deep merge function for settings
  const mergeWithDefaults = (saved, defaults) => {
    const merged = { ...defaults };

    Object.keys(saved).forEach(key => {
      if (typeof saved[key] === 'object' && saved[key] !== null && !Array.isArray(saved[key])) {
        merged[key] = { ...defaults[key], ...saved[key] };
      } else {
        merged[key] = saved[key];
      }
    });

    return merged;
  };

  // Save settings to localStorage
  const saveSettings = async () => {
    try {
      const settingsToSave = { ...state };
      delete settingsToSave.isLoaded;
      delete settingsToSave.hasUnsavedChanges;

      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));

      dispatch({ type: SETTINGS_ACTIONS.MARK_SAVED });

      // Notify Electron main process if available
      if (window.electronAPI && window.electronAPI.saveSettings) {
        await window.electronAPI.saveSettings(settingsToSave);
      }

      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  // Update a top-level setting
  const updateSetting = (key, value) => {
    if (!key || value === undefined) {
      console.warn('Invalid setting key or value');
      return;
    }

    dispatch({
      type: SETTINGS_ACTIONS.UPDATE_SETTING,
      payload: { key, value }
    });
  };

  // Update a nested setting (e.g., editor.fontSize)
  const updateNestedSetting = (section, key, value) => {
    if (!section || !key || value === undefined) {
      console.warn('Invalid nested setting parameters');
      return;
    }

    dispatch({
      type: SETTINGS_ACTIONS.UPDATE_NESTED_SETTING,
      payload: { section, key, value }
    });
  };

  // Update multiple settings at once
  const updateMultipleSettings = (settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          updateNestedSetting(key, nestedKey, nestedValue);
        });
      } else {
        updateSetting(key, value);
      }
    });
  };

  // Reset all settings to defaults
  const resetAllSettings = () => {
    dispatch({ type: SETTINGS_ACTIONS.RESET_SETTINGS });
  };

  // Reset a specific section to defaults
  const resetSection = (section) => {
    if (!DEFAULT_SETTINGS[section]) {
      console.warn(`Settings section "${section}" not found`);
      return;
    }

    dispatch({
      type: SETTINGS_ACTIONS.RESET_SECTION,
      payload: section
    });
  };

  // Get a setting value with optional default
  const getSetting = (key, defaultValue = null) => {
    const value = key.includes('.')
      ? getNestedSetting(key)
      : state[key];

    return value !== undefined ? value : defaultValue;
  };

  // Get a nested setting value (e.g., "editor.fontSize")
  const getNestedSetting = (path) => {
    const keys = path.split('.');
    let current = state;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  };

  // Validate a setting value
  const validateSetting = (key, value) => {
    try {
      switch (key) {
        case 'editor.fontSize':
          return value >= VALIDATION.FONT_SIZE.MIN &&
                 value <= VALIDATION.FONT_SIZE.MAX;

        case 'files.maxRecentFiles':
          return Number.isInteger(value) && value > 0 && value <= 100;

        case 'files.autoSaveDelay':
          return Number.isInteger(value) && value >= 500; // Min 500ms

        case 'performance.maxDocumentSize':
          return Number.isInteger(value) && value > 0 && value <= 1000; // Max 1GB

        default:
          return true; // Allow by default
      }
    } catch (error) {
      console.warn(`Validation failed for ${key}:`, error);
      return false;
    }
  };

  // Export settings as JSON
  const exportSettings = () => {
    const settingsToExport = { ...state };
    delete settingsToExport.isLoaded;
    delete settingsToExport.hasUnsavedChanges;

    return JSON.stringify({
      settings: settingsToExport,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  };

  // Import settings from JSON
  const importSettings = (settingsJson) => {
    try {
      const importData = JSON.parse(settingsJson);

      if (!importData.settings) {
        throw new Error('Invalid settings format');
      }

      const mergedSettings = mergeWithDefaults(importData.settings, DEFAULT_SETTINGS);

      dispatch({
        type: SETTINGS_ACTIONS.LOAD_SETTINGS,
        payload: mergedSettings
      });

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  };

  // Get settings for a specific section
  const getSection = (sectionName) => {
    return state[sectionName] || {};
  };

  // Check if settings have been modified from defaults
  const hasChangesFromDefaults = () => {
    return JSON.stringify(state) !== JSON.stringify({
      ...DEFAULT_SETTINGS,
      isLoaded: state.isLoaded,
      hasUnsavedChanges: state.hasUnsavedChanges
    });
  };

  // Force save settings immediately
  const forceSave = async () => {
    return await saveSettings();
  };

  // Context value
  const contextValue = {
    // State
    settings: state,
    isLoaded: state.isLoaded,
    hasUnsavedChanges: state.hasUnsavedChanges,

    // Getters
    getSetting,
    getNestedSetting,
    getSection,
    hasChangesFromDefaults,

    // Actions
    updateSetting,
    updateNestedSetting,
    updateMultipleSettings,
    resetAllSettings,
    resetSection,
    saveSettings,
    forceSave,

    // Validation
    validateSetting,

    // Import/Export
    exportSettings,
    importSettings,

    // Specific setting getters for convenience
    theme: state.theme,
    editor: state.editor,
    layout: state.layout,
    files: state.files,
    writing: state.writing,
    performance: state.performance
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