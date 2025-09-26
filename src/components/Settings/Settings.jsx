import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import ThemeToggle from '../UI/ThemeToggle.jsx';
import './Settings.css';

const Settings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const {
    currentTheme,
    availableThemes,
    setTheme,
    getCurrentTheme,
    createCustomTheme,
    exportTheme,
    importTheme
  } = useTheme();

  const { settings, updateSettings, isLoading } = useSettings();

  if (!isOpen) return null;

  // Don't render if settings are still loading
  if (isLoading || !settings) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingChange = (category, setting, value) => {
    updateSettings({
      [category]: {
        ...(settings[category] || {}),
        [setting]: value
      }
    });
  };

  const renderAppearanceTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>Theme</h3>
        <div className="theme-selection">
          <div className="current-theme">
            <ThemeToggle size="lg" showLabel={true} />
          </div>

          <div className="theme-grid">
            {availableThemes.map(theme => (
              <div
                key={theme.id}
                className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setTheme(theme.id)}
              >
                <div className={`theme-preview ${theme.type}`}>
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-text"></div>
                    <div className="preview-text short"></div>
                  </div>
                </div>
                <div className="theme-info">
                  <span className="theme-name">{theme.name}</span>
                  {theme.description && (
                    <span className="theme-description">{theme.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Typography</h3>
        <div className="setting-group">
          <label>
            <span>UI Font Size</span>
            <select
              value={settings?.appearance?.fontSize || 16}
              onChange={(e) => handleSettingChange('appearance', 'fontSize', parseInt(e.target.value))}
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
            </select>
          </label>

          <label>
            <span>Editor Font Size</span>
            <select
              value={settings?.editor?.fontSize || 16}
              onChange={(e) => handleSettingChange('editor', 'fontSize', parseInt(e.target.value))}
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
              <option value={22}>22px</option>
              <option value={24}>24px</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Layout</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.layout?.showSidebar ?? true}
              onChange={(e) => handleSettingChange('layout', 'showSidebar', e.target.checked)}
            />
            <span>Show Sidebar</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.layout?.showStatusBar ?? true}
              onChange={(e) => handleSettingChange('layout', 'showStatusBar', e.target.checked)}
            />
            <span>Show Status Bar</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.layout?.compactMode ?? false}
              onChange={(e) => handleSettingChange('layout', 'compactMode', e.target.checked)}
            />
            <span>Compact Mode</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderEditorTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>Editing</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.editor?.wordWrap ?? true}
              onChange={(e) => handleSettingChange('editor', 'wordWrap', e.target.checked)}
            />
            <span>Word Wrap</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.editor?.showLineNumbers ?? false}
              onChange={(e) => handleSettingChange('editor', 'showLineNumbers', e.target.checked)}
            />
            <span>Show Line Numbers</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.writing?.spellCheck ?? true}
              onChange={(e) => handleSettingChange('writing', 'spellCheck', e.target.checked)}
            />
            <span>Spell Check</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Formatting</h3>
        <div className="setting-group">
          <label>
            <span>Line Height</span>
            <select
              value={settings?.editor?.lineHeight || 1.5}
              onChange={(e) => handleSettingChange('editor', 'lineHeight', parseFloat(e.target.value))}
            >
              <option value={1.2}>1.2</option>
              <option value={1.4}>1.4</option>
              <option value={1.5}>1.5</option>
              <option value={1.6}>1.6</option>
              <option value={1.8}>1.8</option>
              <option value={2.0}>2.0</option>
            </select>
          </label>

          <label>
            <span>Font Family</span>
            <select
              value={settings?.editor?.fontFamily || 'default'}
              onChange={(e) => handleSettingChange('editor', 'fontFamily', e.target.value)}
            >
              <option value="default">Default</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>Auto-Save</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.files?.autoSave ?? true}
              onChange={(e) => handleSettingChange('files', 'autoSave', e.target.checked)}
            />
            <span>Enable Auto-Save</span>
          </label>

          <label>
            <span>Auto-Save Delay (seconds)</span>
            <select
              value={settings?.files?.autoSaveDelay || 2000}
              onChange={(e) => handleSettingChange('files', 'autoSaveDelay', parseInt(e.target.value))}
            >
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Backups</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.files?.createBackups ?? true}
              onChange={(e) => handleSettingChange('files', 'createBackups', e.target.checked)}
            />
            <span>Create Backup Files</span>
          </label>

          <label>
            <span>Max Recent Files</span>
            <select
              value={settings?.files?.maxRecentFiles || 20}
              onChange={(e) => handleSettingChange('files', 'maxRecentFiles', parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>Performance</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.performance?.enableVirtualScrolling ?? true}
              onChange={(e) => handleSettingChange('performance', 'enableVirtualScrolling', e.target.checked)}
            />
            <span>Enable Virtual Scrolling</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.performance?.lazyLoadImages ?? true}
              onChange={(e) => handleSettingChange('performance', 'lazyLoadImages', e.target.checked)}
            />
            <span>Lazy Load Images</span>
          </label>

          <label>
            <span>Max Document Size (MB)</span>
            <select
              value={settings?.performance?.maxDocumentSize || 10}
              onChange={(e) => handleSettingChange('performance', 'maxDocumentSize', parseInt(e.target.value))}
            >
              <option value={5}>5 MB</option>
              <option value={10}>10 MB</option>
              <option value={20}>20 MB</option>
              <option value={50}>50 MB</option>
              <option value={100}>100 MB</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Debug</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.debug?.enableLogging ?? false}
              onChange={(e) => handleSettingChange('debug', 'enableLogging', e.target.checked)}
            />
            <span>Enable Debug Logging</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.debug?.showPerformanceMetrics ?? false}
              onChange={(e) => handleSettingChange('debug', 'showPerformanceMetrics', e.target.checked)}
            />
            <span>Show Performance Metrics</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Data</h3>
        <div className="setting-group">
          <button className="settings-button">
            Export Settings
          </button>

          <button className="settings-button">
            Import Settings
          </button>

          <button className="settings-button danger">
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'editor':
        return renderEditorTab();
      case 'files':
        return renderFilesTab();
      case 'advanced':
        return renderAdvancedTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;