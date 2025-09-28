import React, { useState } from 'react';
import { useEditor } from '../../contexts/EditorContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Icon from '../UI/Icon.jsx';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const [activeTab, setActiveTab] = useState('files');
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
    closeDocument,
    recentFiles,
    createNewDocument
  } = useEditor();
  const { availableThemes, currentTheme, setTheme } = useTheme();

  const tabs = [
    { id: 'files', name: 'Files', icon: 'folder', title: 'File Explorer' },
    { id: 'recent', name: 'Recent', icon: 'history', title: 'Recent Files' },
    { id: 'themes', name: 'Themes', icon: 'palette', title: 'Theme Manager' },
    { id: 'outline', name: 'Outline', icon: 'list', title: 'Document Outline' }
  ];

  const handleDocumentSelect = (documentId) => {
    setActiveDocument(documentId);
  };

  const handleCloseDocument = async (e, documentId) => {
    e.stopPropagation();
    await closeDocument(documentId);
  };

  const handleNewDocument = () => {
    createNewDocument();
  };

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  const renderFilesTab = () => (
    <div className="sidebar-content">
      <div className="section-header">
        <h3>Open Documents</h3>
        <button
          className="action-button"
          onClick={handleNewDocument}
          title="New Document"
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className="documents-list">
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents open</p>
            <button className="btn btn-sm" onClick={handleNewDocument}>
              New Document
            </button>
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className={`document-item ${doc.id === activeDocumentId ? 'active' : ''}`}
              onClick={() => handleDocumentSelect(doc.id)}
            >
              <div className="document-icon">
                <Icon name="file-text" size={16} />
              </div>
              <div className="document-info">
                <span className="document-name">{doc.name}</span>
                {doc.isModified && <Icon name="dot" size={8} className="modified-indicator" />}
              </div>
              {doc.filePath && (
                <div className="document-path">{doc.filePath}</div>
              )}
              <button
                className="close-button"
                onClick={(e) => handleCloseDocument(e, doc.id)}
                title="Close Document"
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRecentTab = () => (
    <div className="sidebar-content">
      <div className="section-header">
        <h3>Recent Files</h3>
      </div>

      <div className="recent-files-list">
        {recentFiles.length === 0 ? (
          <div className="empty-state">
            <p>No recent files</p>
          </div>
        ) : (
          recentFiles.slice(0, 10).map((file, index) => (
            <div key={`${file.path}-${index}`} className="recent-file-item">
              <div className="file-icon">
                <Icon name="file-text" size={16} />
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-path">{file.path}</span>
              </div>
              <span className="file-date">
                {new Date(file.lastOpened).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderThemesTab = () => (
    <div className="sidebar-content">
      <div className="section-header">
        <h3>Themes</h3>
      </div>

      <div className="themes-list">
        {availableThemes.map(theme => (
          <div
            key={theme.id}
            className={`theme-item ${theme.id === currentTheme ? 'active' : ''}`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="theme-preview">
              <div className={`preview-dot ${theme.type}`}>
                <Icon
                  name={theme.type === 'dark' ? 'moon' : 'sun'}
                  size={14}
                />
              </div>
            </div>
            <div className="theme-info">
              <span className="theme-name">{theme.name}</span>
              {theme.description && (
                <span className="theme-description">{theme.description}</span>
              )}
            </div>
            {theme.id === currentTheme && (
              <div className="active-indicator">
                <Icon name="check" size={14} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOutlineTab = () => (
    <div className="sidebar-content">
      <div className="section-header">
        <h3>Outline</h3>
      </div>

      <div className="outline-content">
        <div className="empty-state">
          <p>Document outline will appear here</p>
          <small>Headings and structure from your document</small>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'files':
        return renderFilesTab();
      case 'recent':
        return renderRecentTab();
      case 'themes':
        return renderThemesTab();
      case 'outline':
        return renderOutlineTab();
      default:
        return renderFilesTab();
    }
  };

  if (isCollapsed) {
    return (
      <div className="sidebar collapsed">
        <div className="sidebar-tabs vertical">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                onToggleCollapse();
              }}
              title={tab.title}
            >
              <Icon name={tab.icon} size={16} className="tab-icon" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar expanded">
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
            >
              <Icon name={tab.icon} size={16} className="tab-icon" />
              <span className="tab-label">{tab.name}</span>
            </button>
          ))}
        </div>

        <button
          className="collapse-button"
          onClick={onToggleCollapse}
          title="Collapse Sidebar"
        >
          <Icon name="chevron-left" size={14} />
        </button>
      </div>

      <div className="sidebar-body">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Sidebar;