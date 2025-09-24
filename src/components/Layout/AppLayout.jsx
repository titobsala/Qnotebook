import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import StatusBar from './StatusBar.jsx';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const { layout } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const layoutClasses = [
    'app-layout',
    layout.compactMode && 'compact-mode',
    !layout.showSidebar && 'no-sidebar',
    !layout.showStatusBar && 'no-statusbar',
    !layout.showToolbar && 'no-toolbar',
    isSidebarCollapsed && 'sidebar-collapsed'
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {layout.showToolbar && (
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      )}

      <div className="app-body">
        {layout.showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        )}

        <main className="main-content">
          {children}
        </main>
      </div>

      {layout.showStatusBar && <StatusBar />}
    </div>
  );
};

export default AppLayout;