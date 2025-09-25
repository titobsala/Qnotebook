import React from 'react';
import QuillEditor from './QuillEditor.jsx';
import { useEditor } from '../../contexts/EditorContext.jsx';
import './EditorContainer.css';

const EditorContainer = () => {
  const {
    activeDocumentId,
    getActiveDocument,
    createNewDocument,
    openDocument
  } = useEditor();

  const activeDocument = getActiveDocument();

  const handleNewDocument = () => {
    createNewDocument();
  };

  const handleOpenDocument = async () => {
    await openDocument();
  };

  if (!activeDocument) {
    return (
      <div className="editor-container">
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h3>Welcome to Qnotebook</h3>
            <p>Create a new document or open an existing one to start writing.</p>
            <div className="placeholder-actions">
              <button className="btn btn-primary" onClick={handleNewDocument}>
                New Document
              </button>
              <button className="btn btn-secondary" onClick={handleOpenDocument}>
                Open Document
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="document-info">
          <h2 className="document-title">
            {activeDocument.name}
            {activeDocument.isModified && <span className="modified-indicator">●</span>}
          </h2>
          <div className="document-meta">
            {activeDocument.filePath && (
              <span className="file-path">{activeDocument.filePath}</span>
            )}
          </div>
        </div>
      </div>

      <div className="editor-content">
        <QuillEditor
          documentId={activeDocumentId}
          className="main-editor"
        />
      </div>
    </div>
  );
};

export default EditorContainer;