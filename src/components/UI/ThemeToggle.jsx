import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import './ThemeToggle.css';

const ThemeToggle = ({ showLabel = false, size = 'md' }) => {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    toggleTheme,
    isDarkTheme,
    getThemesByType
  } = useTheme();

  const [showDropdown, setShowDropdown] = useState(false);

  const lightThemes = getThemesByType('light');
  const darkThemes = getThemesByType('dark');
  const currentThemeObj = availableThemes.find(theme => theme.id === currentTheme);

  const handleToggle = () => {
    toggleTheme();
  };

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Simple toggle button (light/dark only)
  const SimpleToggle = () => (
    <button
      className={`theme-toggle simple-toggle ${size} ${isDarkTheme() ? 'dark' : 'light'}`}
      onClick={handleToggle}
      title={`Switch to ${isDarkTheme() ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${isDarkTheme() ? 'light' : 'dark'} theme`}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {isDarkTheme() ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          )}
        </div>
      </div>
      {showLabel && (
        <span className="toggle-label">
          {isDarkTheme() ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );

  // Dropdown with all themes
  const DropdownToggle = () => (
    <div className={`theme-toggle dropdown-toggle ${size}`}>
      <button
        className={`theme-button ${showDropdown ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
        title="Select theme"
      >
        <div className="current-theme">
          <div className={`theme-indicator ${isDarkTheme() ? 'dark' : 'light'}`}>
            {isDarkTheme() ? '🌙' : '☀️'}
          </div>
          {showLabel && (
            <span className="theme-name">
              {currentThemeObj?.name || 'Theme'}
            </span>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {showDropdown && (
        <div className="theme-dropdown" role="listbox">
          {lightThemes.length > 0 && (
            <div className="theme-group">
              <div className="group-label">Light Themes</div>
              {lightThemes.map(theme => (
                <button
                  key={theme.id}
                  className={`theme-option ${theme.id === currentTheme ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  role="option"
                  aria-selected={theme.id === currentTheme}
                >
                  <div className="theme-preview light">☀️</div>
                  <div className="theme-info">
                    <span className="theme-name">{theme.name}</span>
                    {theme.description && (
                      <span className="theme-description">{theme.description}</span>
                    )}
                  </div>
                  {theme.id === currentTheme && (
                    <div className="selected-indicator">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {darkThemes.length > 0 && (
            <div className="theme-group">
              <div className="group-label">Dark Themes</div>
              {darkThemes.map(theme => (
                <button
                  key={theme.id}
                  className={`theme-option ${theme.id === currentTheme ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  role="option"
                  aria-selected={theme.id === currentTheme}
                >
                  <div className="theme-preview dark">🌙</div>
                  <div className="theme-info">
                    <span className="theme-name">{theme.name}</span>
                    {theme.description && (
                      <span className="theme-description">{theme.description}</span>
                    )}
                  </div>
                  {theme.id === currentTheme && (
                    <div className="selected-indicator">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Accessibility and Specialty Themes */}
          {availableThemes.some(theme => theme.accessibility || theme.specialty) && (
            <div className="theme-group">
              <div className="group-label">Special Themes</div>
              {availableThemes
                .filter(theme => theme.accessibility || theme.specialty)
                .map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${theme.id === currentTheme ? 'selected' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                    role="option"
                    aria-selected={theme.id === currentTheme}
                  >
                    <div className={`theme-preview ${theme.type}`}>
                      {theme.accessibility ? '♿' : '✨'}
                    </div>
                    <div className="theme-info">
                      <span className="theme-name">{theme.name}</span>
                      {theme.description && (
                        <span className="theme-description">{theme.description}</span>
                      )}
                    </div>
                    {theme.id === currentTheme && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div className="theme-dropdown-backdrop" onClick={closeDropdown} />
      )}
    </div>
  );

  // For header use, show simple toggle; for settings, show dropdown
  return availableThemes.length <= 4 ? <SimpleToggle /> : <DropdownToggle />;
};

export default ThemeToggle;