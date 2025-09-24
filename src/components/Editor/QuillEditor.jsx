import React from 'react';
import { useQuillEditor } from '../../hooks/useQuillEditor.jsx';
import { useEditor } from '../../contexts/EditorContext.jsx';
import 'quill/dist/quill.snow.css';
import './QuillEditor.css';

const QuillEditor = ({ documentId, className = '', ...props }) => {
  const { editorRef } = useQuillEditor(documentId);
  const { getDocumentById } = useEditor();

  const document = getDocumentById(documentId);

  if (!document) {
    return (
      <div className={`quill-editor-container ${className}`} {...props}>
        <div className="editor-error">
          <p>Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`quill-editor-container ${className}`} {...props}>
      <div
        ref={editorRef}
        className="quill-editor"
        data-document-id={documentId}
      />
    </div>
  );
};

export default QuillEditor;