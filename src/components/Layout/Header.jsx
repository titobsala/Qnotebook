import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useEditor } from '../../contexts/EditorContext.jsx';
import ThemeToggle from '../UI/ThemeToggle.jsx';
import useElectron from '../../hooks/useElectron.jsx';
import './Header.css';

const Header = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { getCurrentTheme } = useTheme();
  const {
    createNewDocument,
    saveDocument,
    openDocument,
    getActiveDocument,
    hasUnsavedChanges,
    getQuillInstance
  } = useEditor();
  const { isElectron, windowControls } = useElectron();

  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showWindowMenu, setShowWindowMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeDocument = getActiveDocument();
  const currentTheme = getCurrentTheme();

  // Update window state
  useEffect(() => {
    const updateWindowState = async () => {
      if (isElectron) {
        setIsMaximized(await windowControls.isMaximized());
        setIsFullscreen(await windowControls.isFullscreen());
      }
    };
    updateWindowState();

    // Listen for window state changes
    const handleResize = () => updateWindowState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isElectron, windowControls]);

  const handleNewDocument = () => {
    createNewDocument();
    setShowFileMenu(false);
  };

  const handleOpenDocument = async () => {
    await openDocument();
    setShowFileMenu(false);
  };

  const handleSaveDocument = async () => {
    if (activeDocument) {
      await saveDocument(activeDocument.id);
    }
    setShowFileMenu(false);
  };

  const handleSaveAs = async () => {
    if (activeDocument) {
      await saveDocument(activeDocument.id, null); // Force save dialog
    }
    setShowFileMenu(false);
  };

  const toggleFileMenu = () => {
    setShowFileMenu(!showFileMenu);
    setShowEditMenu(false);
    setShowViewMenu(false);
    setShowWindowMenu(false);
    setShowHelpMenu(false);
  };

  const toggleEditMenu = () => {
    setShowEditMenu(!showEditMenu);
    setShowFileMenu(false);
    setShowViewMenu(false);
    setShowWindowMenu(false);
    setShowHelpMenu(false);
  };

  const toggleViewMenu = () => {
    setShowViewMenu(!showViewMenu);
    setShowFileMenu(false);
    setShowEditMenu(false);
    setShowWindowMenu(false);
    setShowHelpMenu(false);
  };

  const toggleWindowMenu = () => {
    setShowWindowMenu(!showWindowMenu);
    setShowFileMenu(false);
    setShowEditMenu(false);
    setShowViewMenu(false);
    setShowHelpMenu(false);
  };

  const toggleHelpMenu = () => {
    setShowHelpMenu(!showHelpMenu);
    setShowFileMenu(false);
    setShowEditMenu(false);
    setShowViewMenu(false);
    setShowWindowMenu(false);
  };

  const closeAllMenus = () => {
    setShowFileMenu(false);
    setShowEditMenu(false);
    setShowViewMenu(false);
    setShowWindowMenu(false);
    setShowHelpMenu(false);
  };

  // Edit menu handlers
  const handleUndo = () => {
    const quill = getQuillInstance(activeDocument?.id);
    if (quill) {
      quill.history.undo();
    }
    setShowEditMenu(false);
  };

  const handleRedo = () => {
    const quill = getQuillInstance(activeDocument?.id);
    if (quill) {
      quill.history.redo();
    }
    setShowEditMenu(false);
  };

  const handleCut = () => {
    document.execCommand('cut');
    setShowEditMenu(false);
  };

  const handleCopy = () => {
    document.execCommand('copy');
    setShowEditMenu(false);
  };

  const handlePaste = () => {
    document.execCommand('paste');
    setShowEditMenu(false);
  };

  const handleFind = () => {
    // For now, use browser's find functionality
    // Later we can implement custom find dialog
    if (document.body.requestFullscreen) {
      // Use Ctrl+F for find
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);
    }
    setShowEditMenu(false);
  };

  const handleReplace = () => {
    // For now, use browser's find and replace functionality
    // Later we can implement custom find/replace dialog
    if (document.body.requestFullscreen) {
      // Use Ctrl+H for find and replace
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);
    }
    setShowEditMenu(false);
  };

  // Window menu handlers
  const handleMinimize = () => {
    if (isElectron) {
      windowControls.minimize();
    } else {
      window.minimize();
    }
    setShowWindowMenu(false);
  };

  const handleMaximizeRestore = () => {
    if (isElectron) {
      if (isMaximized) {
        windowControls.restore();
      } else {
        windowControls.maximize();
      }
    }
    setShowWindowMenu(false);
  };

  const handleToggleFullscreen = () => {
    if (isElectron) {
      windowControls.toggleFullscreen();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
    setShowWindowMenu(false);
  };

  const handleCloseWindow = () => {
    if (isElectron) {
      windowControls.close();
    } else {
      window.close();
    }
    setShowWindowMenu(false);
  };

  // Help menu handlers
  const handleAbout = () => {
    const version = '1.0.0'; // You can get this from package.json
    alert(`Qnotebook v${version}\nA minimalist desktop editor built with React, Electron, and Quill.`);
    setShowHelpMenu(false);
  };

  const handleKeyboardShortcuts = () => {
    const shortcuts = `
Keyboard Shortcuts:
───────────────────
File Operations:
  New Document: Ctrl+N
  Open: Ctrl+O
  Save: Ctrl+S
  Save As: Ctrl+Shift+S

Editing:
  Undo: Ctrl+Z
  Redo: Ctrl+Y
  Cut: Ctrl+X
  Copy: Ctrl+C
  Paste: Ctrl+V
  Find: Ctrl+F
  Replace: Ctrl+H

View:
  Toggle Sidebar: Ctrl+B
  Zoom In: Ctrl++
  Zoom Out: Ctrl+-
  Reset Zoom: Ctrl+0

Window:
  Toggle Fullscreen: F11
  Minimize: Alt+F9
  Close: Alt+F4

Other:
  Toggle Theme: Click theme button
    `;
    alert(shortcuts);
    setShowHelpMenu(false);
  };

  const handleDocumentation = () => {
    // Open documentation in browser
    window.open('https://github.com/titobsala/qnotebook', '_blank');
    setShowHelpMenu(false);
  };

  const handleReportIssue = () => {
    // Open GitHub issues in browser
    window.open('https://github.com/titobsala/qnotebook/issues/new', '_blank');
    setShowHelpMenu(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-content">
        {/* Left section - Menu and controls */}
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
            aria-label={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </button>

          {/* Menu Bar */}
          <nav className="menu-bar" role="menubar">
            {/* File Menu */}
            <div className="menu-item">
              <button
                className={`menu-trigger ${showFileMenu ? 'active' : ''}`}
                onClick={toggleFileMenu}
                aria-haspopup="menu"
                aria-expanded={showFileMenu}
              >
                File
              </button>
              {showFileMenu && (
                <div className="menu-dropdown" role="menu">
                  <button className="menu-option" role="menuitem" onClick={handleNewDocument}>
                    <span>New Document</span>
                    <span className="shortcut">Ctrl+N</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleOpenDocument}>
                    <span>Open...</span>
                    <span className="shortcut">Ctrl+O</span>
                  </button>
                  <div className="menu-separator" />
                  <button
                    className="menu-option"
                    role="menuitem"
                    onClick={handleSaveDocument}
                    disabled={!activeDocument || !activeDocument.isModified}
                  >
                    <span>Save</span>
                    <span className="shortcut">Ctrl+S</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleSaveAs}>
                    <span>Save As...</span>
                    <span className="shortcut">Ctrl+Shift+S</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem">
                    <span>Export as PDF</span>
                    <span className="shortcut">Ctrl+E</span>
                  </button>
                  <button className="menu-option" role="menuitem">
                    <span>Export as HTML</span>
                    <span className="shortcut">Ctrl+Shift+E</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem">
                    <span>Page Setup...</span>
                  </button>
                  <button className="menu-option" role="menuitem">
                    <span>Print...</span>
                    <span className="shortcut">Ctrl+P</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="menu-item">
              <button
                className={`menu-trigger ${showEditMenu ? 'active' : ''}`}
                onClick={toggleEditMenu}
                aria-haspopup="menu"
                aria-expanded={showEditMenu}
              >
                Edit
              </button>
              {showEditMenu && (
                <div className="menu-dropdown" role="menu">
                  <button className="menu-option" role="menuitem" onClick={handleUndo}>
                    <span>Undo</span>
                    <span className="shortcut">Ctrl+Z</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleRedo}>
                    <span>Redo</span>
                    <span className="shortcut">Ctrl+Y</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem" onClick={handleCut}>
                    <span>Cut</span>
                    <span className="shortcut">Ctrl+X</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleCopy}>
                    <span>Copy</span>
                    <span className="shortcut">Ctrl+C</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handlePaste}>
                    <span>Paste</span>
                    <span className="shortcut">Ctrl+V</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem" onClick={handleFind}>
                    <span>Find</span>
                    <span className="shortcut">Ctrl+F</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleReplace}>
                    <span>Replace</span>
                    <span className="shortcut">Ctrl+H</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="menu-item">
              <button
                className={`menu-trigger ${showViewMenu ? 'active' : ''}`}
                onClick={toggleViewMenu}
                aria-haspopup="menu"
                aria-expanded={showViewMenu}
              >
                View
              </button>
              {showViewMenu && (
                <div className="menu-dropdown" role="menu">
                  <button className="menu-option" role="menuitem" onClick={onToggleSidebar}>
                    <span>{isSidebarCollapsed ? 'Show' : 'Hide'} Sidebar</span>
                    <span className="shortcut">Ctrl+B</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem">
                    <span>Zoom In</span>
                    <span className="shortcut">Ctrl++</span>
                  </button>
                  <button className="menu-option" role="menuitem">
                    <span>Zoom Out</span>
                    <span className="shortcut">Ctrl+-</span>
                  </button>
                  <button className="menu-option" role="menuitem">
                    <span>Reset Zoom</span>
                    <span className="shortcut">Ctrl+0</span>
                  </button>
                </div>
              )}
            </div>

            {/* Window Menu */}
            <div className="menu-item">
              <button
                className={`menu-trigger ${showWindowMenu ? 'active' : ''}`}
                onClick={toggleWindowMenu}
                aria-haspopup="menu"
                aria-expanded={showWindowMenu}
              >
                Window
              </button>
              {showWindowMenu && (
                <div className="menu-dropdown" role="menu">
                  <button className="menu-option" role="menuitem" onClick={handleMinimize}>
                    <span>Minimize</span>
                    <span className="shortcut">Ctrl+M</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleMaximizeRestore}>
                    <span>{isMaximized ? 'Restore' : 'Maximize'}</span>
                    <span className="shortcut">Ctrl+Shift+M</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleToggleFullscreen}>
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                    <span className="shortcut">F11</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem" onClick={handleCloseWindow}>
                    <span>Close Window</span>
                    <span className="shortcut">Ctrl+W</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="menu-item">
              <button
                className={`menu-trigger ${showHelpMenu ? 'active' : ''}`}
                onClick={toggleHelpMenu}
                aria-haspopup="menu"
                aria-expanded={showHelpMenu}
              >
                Help
              </button>
              {showHelpMenu && (
                <div className="menu-dropdown" role="menu">
                  <button className="menu-option" role="menuitem" onClick={handleAbout}>
                    <span>About QuillDE</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem" onClick={handleKeyboardShortcuts}>
                    <span>Keyboard Shortcuts</span>
                    <span className="shortcut">Ctrl+/</span>
                  </button>
                  <button className="menu-option" role="menuitem" onClick={handleDocumentation}>
                    <span>Documentation</span>
                  </button>
                  <div className="menu-separator" />
                  <button className="menu-option" role="menuitem" onClick={handleReportIssue}>
                    <span>Report Issue</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center section - Document title */}
        <div className="header-center">
          {activeDocument && (
            <div className="document-title-header">
              <span className="title">{activeDocument.name}</span>
              {activeDocument.isModified && (
                <span className="modified-indicator" title="Document has unsaved changes">●</span>
              )}
            </div>
          )}
        </div>

        {/* Right section - Theme toggle and actions */}
        <div className="header-right">
          <div className="header-actions">
            {hasUnsavedChanges() && (
              <div className="unsaved-indicator" title="You have unsaved changes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            )}

            <ThemeToggle />

            <button
              className="settings-button"
              title="Settings"
              aria-label="Open Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop to close menus when clicking outside */}
      {(showFileMenu || showEditMenu || showViewMenu || showWindowMenu || showHelpMenu) && (
        <div className="menu-backdrop" onClick={closeAllMenus} />
      )}
    </header>
  );
};

export default Header;