import React from 'react';
import { useEditor } from '../../contexts/EditorContext.jsx';
import Icon from '../UI/Icon.jsx';
import './StatusBar.css';

const StatusBar = () => {
  const {
    getActiveDocument,
    getDocumentStats,
    documents,
  } = useEditor();


  const activeDocument = getActiveDocument();
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
      {/* Left Section - Document Status */}
      <div className="status-section left">
        {activeDocument && (
          <div className="status-pill document-pill">
            <Icon name="file-text" size={14} />
            <span className="document-name" title={activeDocument.name}>
              {activeDocument.name}
            </span>
            {activeDocument.isModified && (
              <div className="modified-dot" title="Document has unsaved changes" />
            )}
          </div>
        )}

        {documents.length > 1 && (
          <div className="status-pill docs-pill">
            <Icon name="folder-open" size={14} />
            <span>{documents.length} docs</span>
          </div>
        )}
      </div>

      {/* Center Section - Document Statistics */}
      <div className="status-section center">
        {documentStats && (
          <div className="stats-container">
            <div className="status-pill stats-pill">
              <Icon name="edit-3" size={14} />
              <span>{documentStats.wordCount.toLocaleString()} words</span>
            </div>

            <div className="status-pill stats-pill">
              <Icon name="type" size={14} />
              <span>{documentStats.characterCount.toLocaleString()} chars</span>
            </div>

            {documentStats.readingTime > 0 && (
              <div className="status-pill stats-pill">
                <Icon name="clock" size={14} />
                <span>{formatReadingTime(documentStats.readingTime)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section - File Info & Time */}
      <div className="status-section right">
        {activeDocument && (
          <div className="file-info-container">
            <div className="status-pill file-pill">
              <Icon name="hard-drive" size={14} />
              <span>{formatFileSize(activeDocument.content)}</span>
            </div>

            <div className="status-pill file-pill">
              <span>UTF-8</span>
            </div>
          </div>
        )}

        <div className="status-pill time-pill">
          <Icon name="clock" size={14} />
          <span>
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