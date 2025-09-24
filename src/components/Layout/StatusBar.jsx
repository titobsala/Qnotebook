import React from 'react';
import { useEditor } from '../../contexts/EditorContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import './StatusBar.css';

const StatusBar = () => {
  const {
    getActiveDocument,
    getDocumentStats,
    documents,
    hasUnsavedChanges
  } = useEditor();
  const { getCurrentTheme } = useTheme();

  const activeDocument = getActiveDocument();
  const currentTheme = getCurrentTheme();
  const documentStats = activeDocument ? getDocumentStats(activeDocument.id) : null;

  const formatReadingTime = (minutes) => {
    if (minutes < 1) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${Math.ceil(minutes)} min read`;
  };

  const formatFileSize = (content) => {
    if (!content) return '0 B';
    const bytes = new Blob([content]).size;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="status-bar" role="status">
      <div className="status-left">
        {/* Document Info */}
        {activeDocument && (
          <>
            <div className="status-item document-status">
              <span className="label">Document:</span>
              <span className="value">{activeDocument.name}</span>
              {activeDocument.isModified && (
                <span className="modified-indicator" title="Document has unsaved changes">●</span>
              )}
            </div>

            {activeDocument.filePath && (
              <div className="status-item file-path">
                <span className="value" title={activeDocument.filePath}>
                  {activeDocument.filePath.split('/').pop()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Multiple Documents Indicator */}
        {documents.length > 1 && (
          <div className="status-item documents-count">
            <span className="value">{documents.length} documents open</span>
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges() && (
          <div className="status-item unsaved-changes">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span className="value">Unsaved changes</span>
          </div>
        )}
      </div>

      <div className="status-center">
        {/* Document Statistics */}
        {documentStats && (
          <div className="status-group stats">
            <div className="status-item word-count">
              <span className="label">Words:</span>
              <span className="value">{documentStats.wordCount.toLocaleString()}</span>
            </div>

            <div className="status-item char-count">
              <span className="label">Characters:</span>
              <span className="value">{documentStats.characterCount.toLocaleString()}</span>
            </div>

            {documentStats.readingTime > 0 && (
              <div className="status-item reading-time">
                <span className="value">{formatReadingTime(documentStats.readingTime)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="status-right">
        {/* File Info */}
        {activeDocument && (
          <div className="status-group file-info">
            <div className="status-item file-size">
              <span className="label">Size:</span>
              <span className="value">{formatFileSize(activeDocument.content)}</span>
            </div>

            <div className="status-item encoding">
              <span className="value">UTF-8</span>
            </div>

            <div className="status-item line-endings">
              <span className="value">LF</span>
            </div>
          </div>
        )}

        {/* Theme Info */}
        <div className="status-item theme-info">
          <span className="theme-indicator">
            {currentTheme.type === 'dark' ? '🌙' : '☀️'}
          </span>
          <span className="value">{currentTheme.name}</span>
        </div>

        {/* Current Time */}
        <div className="status-item current-time">
          <span className="value">
            {new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;