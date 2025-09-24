import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { THEMES, STORAGE_KEYS, CSS_VARIABLES } from '../utils/constants.js';

// Initial state
const initialState = {
  currentTheme: THEMES.LIGHT.id,
  availableThemes: Object.values(THEMES).filter(theme => !theme.hidden),
  customThemes: {},
  systemThemeSync: true,
  autoThemeSwitch: false,
  themePreferences: {
    lightTheme: THEMES.LIGHT.id,
    darkTheme: THEMES.DARK.id
  }
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  ADD_CUSTOM_THEME: 'ADD_CUSTOM_THEME',
  REMOVE_CUSTOM_THEME: 'REMOVE_CUSTOM_THEME',
  UPDATE_THEME_PREFERENCES: 'UPDATE_THEME_PREFERENCES',
  TOGGLE_SYSTEM_SYNC: 'TOGGLE_SYSTEM_SYNC',
  TOGGLE_AUTO_SWITCH: 'TOGGLE_AUTO_SWITCH',
  LOAD_SAVED_STATE: 'LOAD_SAVED_STATE'
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload
      };

    case THEME_ACTIONS.ADD_CUSTOM_THEME:
      return {
        ...state,
        customThemes: {
          ...state.customThemes,
          [action.payload.id]: action.payload
        },
        availableThemes: [
          ...state.availableThemes.filter(theme => theme.id !== action.payload.id),
          action.payload
        ]
      };

    case THEME_ACTIONS.REMOVE_CUSTOM_THEME:
      const { [action.payload]: removed, ...remainingCustomThemes } = state.customThemes;
      return {
        ...state,
        customThemes: remainingCustomThemes,
        availableThemes: state.availableThemes.filter(theme => theme.id !== action.payload),
        currentTheme: state.currentTheme === action.payload ? THEMES.LIGHT.id : state.currentTheme
      };

    case THEME_ACTIONS.UPDATE_THEME_PREFERENCES:
      return {
        ...state,
        themePreferences: {
          ...state.themePreferences,
          ...action.payload
        }
      };

    case THEME_ACTIONS.TOGGLE_SYSTEM_SYNC:
      return {
        ...state,
        systemThemeSync: action.payload
      };

    case THEME_ACTIONS.TOGGLE_AUTO_SWITCH:
      return {
        ...state,
        autoThemeSwitch: action.payload
      };

    case THEME_ACTIONS.LOAD_SAVED_STATE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedTheme) {
          const themeData = JSON.parse(savedTheme);
          dispatch({
            type: THEME_ACTIONS.LOAD_SAVED_STATE,
            payload: themeData
          });
        }

        // Check for system theme preference if sync is enabled
        if (state.systemThemeSync && window.matchMedia) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = prefersDark ? state.themePreferences.darkTheme : state.themePreferences.lightTheme;
          setTheme(systemTheme);
        }
      } catch (error) {
        console.warn('Failed to load saved theme state:', error);
      }
    };

    loadSavedState();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const themeState = {
        currentTheme: state.currentTheme,
        customThemes: state.customThemes,
        systemThemeSync: state.systemThemeSync,
        autoThemeSwitch: state.autoThemeSwitch,
        themePreferences: state.themePreferences
      };
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(themeState));
    } catch (error) {
      console.warn('Failed to save theme state:', error);
    }
  }, [state]);

  // Apply theme to DOM
  useEffect(() => {
    applyThemeToDOM(state.currentTheme);
  }, [state.currentTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!state.systemThemeSync || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const systemTheme = e.matches ? state.themePreferences.darkTheme : state.themePreferences.lightTheme;
      setTheme(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.systemThemeSync, state.themePreferences]);

  // Apply theme to DOM element
  const applyThemeToDOM = (themeId) => {
    const root = document.documentElement;

    // Remove existing theme data attribute
    const existingTheme = root.getAttribute('data-theme');
    if (existingTheme) {
      root.removeAttribute('data-theme');
    }

    // Set new theme data attribute
    root.setAttribute('data-theme', themeId);

    // Apply custom theme variables if it's a custom theme
    const customTheme = state.customThemes[themeId];
    if (customTheme && customTheme.variables) {
      Object.entries(customTheme.variables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }

    // Dispatch custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { themeId, theme: getThemeById(themeId) }
    }));
  };

  // Get theme by ID
  const getThemeById = (themeId) => {
    return state.availableThemes.find(theme => theme.id === themeId) || THEMES.LIGHT;
  };

  // Get current theme object
  const getCurrentTheme = () => {
    return getThemeById(state.currentTheme);
  };

  // Set theme
  const setTheme = (themeId) => {
    if (!themeId || !getThemeById(themeId)) {
      console.warn(`Theme ${themeId} not found`);
      return;
    }

    dispatch({
      type: THEME_ACTIONS.SET_THEME,
      payload: themeId
    });
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme.type === 'light'
      ? state.themePreferences.darkTheme
      : state.themePreferences.lightTheme;
    setTheme(newTheme);
  };

  // Create custom theme
  const createCustomTheme = (themeData) => {
    const customTheme = {
      id: `custom-${Date.now()}`,
      name: themeData.name || 'Custom Theme',
      type: themeData.type || 'light',
      description: themeData.description || 'Custom user theme',
      variables: themeData.variables || {},
      custom: true
    };

    dispatch({
      type: THEME_ACTIONS.ADD_CUSTOM_THEME,
      payload: customTheme
    });

    return customTheme.id;
  };

  // Update existing custom theme
  const updateCustomTheme = (themeId, updates) => {
    const existingTheme = state.customThemes[themeId];
    if (!existingTheme) {
      console.warn(`Custom theme ${themeId} not found`);
      return;
    }

    const updatedTheme = {
      ...existingTheme,
      ...updates,
      variables: {
        ...existingTheme.variables,
        ...updates.variables
      }
    };

    dispatch({
      type: THEME_ACTIONS.ADD_CUSTOM_THEME,
      payload: updatedTheme
    });
  };

  // Remove custom theme
  const removeCustomTheme = (themeId) => {
    if (!state.customThemes[themeId]) {
      console.warn(`Custom theme ${themeId} not found`);
      return;
    }

    dispatch({
      type: THEME_ACTIONS.REMOVE_CUSTOM_THEME,
      payload: themeId
    });
  };

  // Export theme
  const exportTheme = (themeId) => {
    const theme = getThemeById(themeId);
    if (!theme) return null;

    const exportData = {
      ...theme,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  };

  // Import theme
  const importTheme = (themeJson) => {
    try {
      const themeData = JSON.parse(themeJson);

      // Validate theme data
      if (!themeData.name || !themeData.type) {
        throw new Error('Invalid theme format');
      }

      // Generate new ID to prevent conflicts
      const customTheme = {
        ...themeData,
        id: `imported-${Date.now()}`,
        custom: true,
        imported: true
      };

      dispatch({
        type: THEME_ACTIONS.ADD_CUSTOM_THEME,
        payload: customTheme
      });

      return customTheme.id;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  };

  // Update theme preferences
  const updateThemePreferences = (preferences) => {
    dispatch({
      type: THEME_ACTIONS.UPDATE_THEME_PREFERENCES,
      payload: preferences
    });
  };

  // Toggle system theme sync
  const toggleSystemThemeSync = (enabled) => {
    dispatch({
      type: THEME_ACTIONS.TOGGLE_SYSTEM_SYNC,
      payload: enabled
    });
  };

  // Toggle auto theme switch
  const toggleAutoThemeSwitch = (enabled) => {
    dispatch({
      type: THEME_ACTIONS.TOGGLE_AUTO_SWITCH,
      payload: enabled
    });
  };

  // Get themes by type
  const getThemesByType = (type) => {
    return state.availableThemes.filter(theme => theme.type === type);
  };

  // Check if current theme is dark
  const isDarkTheme = () => {
    return getCurrentTheme().type === 'dark';
  };

  // Context value
  const contextValue = {
    // State
    currentTheme: state.currentTheme,
    availableThemes: state.availableThemes,
    customThemes: state.customThemes,
    systemThemeSync: state.systemThemeSync,
    autoThemeSwitch: state.autoThemeSwitch,
    themePreferences: state.themePreferences,

    // Getters
    getCurrentTheme,
    getThemeById,
    getThemesByType,
    isDarkTheme,

    // Actions
    setTheme,
    toggleTheme,
    createCustomTheme,
    updateCustomTheme,
    removeCustomTheme,
    exportTheme,
    importTheme,
    updateThemePreferences,
    toggleSystemThemeSync,
    toggleAutoThemeSwitch
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;