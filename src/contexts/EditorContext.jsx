import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';

// Document structure
const createDocument = (id, name = 'Untitled', content = '', filePath = null) => ({
  id,
  name,
  content,
  filePath,
  isModified: false,
  isSaved: filePath !== null,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  wordCount: 0,
  characterCount: 0,
  readingTime: 0
});

// Initial state
const initialState = {
  documents: [createDocument('doc-1', 'Untitled', '')],
  activeDocumentId: 'doc-1',
  quillInstances: {},
  recentFiles: [],
  isAutoSaveEnabled: true,
  autoSaveDelay: 2000,
  lastSavedAt: null,
  pendingSaves: new Set(),
  documentStats: {}
};

// Action types
const EDITOR_ACTIONS = {
  // Document management
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  CLOSE_DOCUMENT: 'CLOSE_DOCUMENT',
  SET_ACTIVE_DOCUMENT: 'SET_ACTIVE_DOCUMENT',
  UPDATE_DOCUMENT_CONTENT: 'UPDATE_DOCUMENT_CONTENT',
  UPDATE_DOCUMENT_META: 'UPDATE_DOCUMENT_META',
  RENAME_DOCUMENT: 'RENAME_DOCUMENT',
  SAVE_DOCUMENT: 'SAVE_DOCUMENT',
  MARK_DOCUMENT_SAVED: 'MARK_DOCUMENT_SAVED',

  // Quill instances
  REGISTER_QUILL_INSTANCE: 'REGISTER_QUILL_INSTANCE',
  UNREGISTER_QUILL_INSTANCE: 'UNREGISTER_QUILL_INSTANCE',

  // Recent files
  ADD_RECENT_FILE: 'ADD_RECENT_FILE',
  REMOVE_RECENT_FILE: 'REMOVE_RECENT_FILE',
  CLEAR_RECENT_FILES: 'CLEAR_RECENT_FILES',

  // Auto-save
  SET_AUTO_SAVE: 'SET_AUTO_SAVE',
  ADD_PENDING_SAVE: 'ADD_PENDING_SAVE',
  REMOVE_PENDING_SAVE: 'REMOVE_PENDING_SAVE',
  UPDATE_LAST_SAVED: 'UPDATE_LAST_SAVED',

  // Statistics
  UPDATE_DOCUMENT_STATS: 'UPDATE_DOCUMENT_STATS',

  // State management
  LOAD_EDITOR_STATE: 'LOAD_EDITOR_STATE'
};

// Editor reducer
const editorReducer = (state, action) => {
  switch (action.type) {
    case EDITOR_ACTIONS.CREATE_DOCUMENT:
      const newDoc = createDocument(action.payload.id, action.payload.name, action.payload.content, action.payload.filePath);
      return {
        ...state,
        documents: [...state.documents, newDoc],
        activeDocumentId: newDoc.id
      };

    case EDITOR_ACTIONS.CLOSE_DOCUMENT:
      const remainingDocs = state.documents.filter(doc => doc.id !== action.payload);
      let newActiveId = state.activeDocumentId;

      // If closing the active document, switch to another one
      if (state.activeDocumentId === action.payload) {
        if (remainingDocs.length > 0) {
          newActiveId = remainingDocs[0].id;
        } else {
          // Create a new empty document if no documents remain
          const emptyDoc = createDocument(`doc-${Date.now()}`, 'Untitled', '');
          return {
            ...state,
            documents: [emptyDoc],
            activeDocumentId: emptyDoc.id,
            quillInstances: { ...state.quillInstances, [action.payload]: undefined }
          };
        }
      }

      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: newActiveId,
        quillInstances: { ...state.quillInstances, [action.payload]: undefined }
      };

    case EDITOR_ACTIONS.SET_ACTIVE_DOCUMENT:
      return {
        ...state,
        activeDocumentId: action.payload
      };

    case EDITOR_ACTIONS.UPDATE_DOCUMENT_CONTENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? {
                ...doc,
                content: action.payload.content,
                isModified: true,
                modifiedAt: new Date().toISOString()
              }
            : doc
        )
      };

    case EDITOR_ACTIONS.UPDATE_DOCUMENT_META:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? { ...doc, ...action.payload.updates }
            : doc
        )
      };

    case EDITOR_ACTIONS.RENAME_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? {
                ...doc,
                name: action.payload.name,
                isModified: true,
                modifiedAt: new Date().toISOString()
              }
            : doc
        )
      };

    case EDITOR_ACTIONS.SAVE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? {
                ...doc,
                filePath: action.payload.filePath,
                isSaved: true,
                isModified: false,
                modifiedAt: new Date().toISOString()
              }
            : doc
        )
      };

    case EDITOR_ACTIONS.MARK_DOCUMENT_SAVED:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload
            ? { ...doc, isModified: false, isSaved: true }
            : doc
        )
      };

    case EDITOR_ACTIONS.REGISTER_QUILL_INSTANCE:
      return {
        ...state,
        quillInstances: {
          ...state.quillInstances,
          [action.payload.documentId]: action.payload.instance
        }
      };

    case EDITOR_ACTIONS.UNREGISTER_QUILL_INSTANCE:
      const { [action.payload]: removed, ...remainingInstances } = state.quillInstances;
      return {
        ...state,
        quillInstances: remainingInstances
      };

    case EDITOR_ACTIONS.ADD_RECENT_FILE:
      const newRecentFiles = [
        action.payload,
        ...state.recentFiles.filter(file => file.path !== action.payload.path)
      ].slice(0, 20); // Keep only last 20 files

      return {
        ...state,
        recentFiles: newRecentFiles
      };

    case EDITOR_ACTIONS.REMOVE_RECENT_FILE:
      return {
        ...state,
        recentFiles: state.recentFiles.filter(file => file.path !== action.payload)
      };

    case EDITOR_ACTIONS.CLEAR_RECENT_FILES:
      return {
        ...state,
        recentFiles: []
      };

    case EDITOR_ACTIONS.SET_AUTO_SAVE:
      return {
        ...state,
        isAutoSaveEnabled: action.payload.enabled,
        autoSaveDelay: action.payload.delay || state.autoSaveDelay
      };

    case EDITOR_ACTIONS.ADD_PENDING_SAVE:
      return {
        ...state,
        pendingSaves: new Set([...state.pendingSaves, action.payload])
      };

    case EDITOR_ACTIONS.REMOVE_PENDING_SAVE:
      const newPendingSaves = new Set(state.pendingSaves);
      newPendingSaves.delete(action.payload);
      return {
        ...state,
        pendingSaves: newPendingSaves
      };

    case EDITOR_ACTIONS.UPDATE_LAST_SAVED:
      return {
        ...state,
        lastSavedAt: new Date().toISOString()
      };

    case EDITOR_ACTIONS.UPDATE_DOCUMENT_STATS:
      return {
        ...state,
        documentStats: {
          ...state.documentStats,
          [action.payload.documentId]: action.payload.stats
        }
      };

    case EDITOR_ACTIONS.LOAD_EDITOR_STATE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Create context
const EditorContext = createContext();

// Editor provider component
export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Load editor state on mount
  useEffect(() => {
    const loadEditorState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          dispatch({
            type: EDITOR_ACTIONS.LOAD_EDITOR_STATE,
            payload: {
              ...parsedState,
              quillInstances: {}, // Don't restore Quill instances
              pendingSaves: new Set() // Reset pending saves
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load editor state:', error);
      }
    };

    loadEditorState();
  }, []);

  // Save editor state when it changes
  useEffect(() => {
    const stateToSave = {
      documents: state.documents,
      activeDocumentId: state.activeDocumentId,
      recentFiles: state.recentFiles,
      isAutoSaveEnabled: state.isAutoSaveEnabled,
      autoSaveDelay: state.autoSaveDelay,
      documentStats: state.documentStats
    };

    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save editor state:', error);
    }
  }, [state.documents, state.activeDocumentId, state.recentFiles, state.isAutoSaveEnabled, state.autoSaveDelay, state.documentStats]);

  // Auto-save functionality
  useEffect(() => {
    if (!state.isAutoSaveEnabled) return;

    const modifiedDocuments = state.documents.filter(doc => doc.isModified && doc.filePath);

    if (modifiedDocuments.length === 0) return;

    const autoSaveTimer = setTimeout(() => {
      modifiedDocuments.forEach(doc => {
        if (!state.pendingSaves.has(doc.id)) {
          saveDocument(doc.id);
        }
      });
    }, state.autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [state.documents, state.isAutoSaveEnabled, state.autoSaveDelay]);

  // Get active document
  const getActiveDocument = () => {
    return state.documents.find(doc => doc.id === state.activeDocumentId);
  };

  // Get document by ID
  const getDocumentById = (id) => {
    return state.documents.find(doc => doc.id === id);
  };

  // Create new document
  const createNewDocument = (name = 'Untitled', content = '', filePath = null) => {
    const id = `doc-${Date.now()}`;
    dispatch({
      type: EDITOR_ACTIONS.CREATE_DOCUMENT,
      payload: { id, name, content, filePath }
    });
    return id;
  };

  // Close document
  const closeDocument = async (documentId) => {
    const document = getDocumentById(documentId);
    if (!document) return false;

    // Check if document has unsaved changes
    if (document.isModified) {
      if (window.electronAPI && window.electronAPI.showMessageBox) {
        const result = await window.electronAPI.showMessageBox({
          type: 'question',
          buttons: ['Save', "Don't Save", 'Cancel'],
          message: `Do you want to save the changes to "${document.name}"?`,
          detail: 'Your changes will be lost if you don\'t save them.'
        });

        if (result.response === 0) { // Save
          await saveDocument(documentId);
        } else if (result.response === 2) { // Cancel
          return false;
        }
      }
    }

    dispatch({
      type: EDITOR_ACTIONS.CLOSE_DOCUMENT,
      payload: documentId
    });

    return true;
  };

  // Set active document
  const setActiveDocument = (documentId) => {
    if (!getDocumentById(documentId)) {
      console.warn(`Document ${documentId} not found`);
      return;
    }

    dispatch({
      type: EDITOR_ACTIONS.SET_ACTIVE_DOCUMENT,
      payload: documentId
    });
  };

  // Update document content
  const updateDocumentContent = (documentId, content) => {
    dispatch({
      type: EDITOR_ACTIONS.UPDATE_DOCUMENT_CONTENT,
      payload: { id: documentId, content }
    });

    // Update document statistics
    updateDocumentStatistics(documentId, content);
  };

  // Calculate document statistics
  const updateDocumentStatistics = useCallback((documentId, content) => {
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    const stats = {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      readingTime,
      updatedAt: new Date().toISOString()
    };

    dispatch({
      type: EDITOR_ACTIONS.UPDATE_DOCUMENT_STATS,
      payload: { documentId, stats }
    });
  }, []);

  // Save document
  const saveDocument = async (documentId, savePath = null) => {
    const document = getDocumentById(documentId);
    if (!document) {
      console.warn(`Document ${documentId} not found`);
      return false;
    }

    try {
      dispatch({
        type: EDITOR_ACTIONS.ADD_PENDING_SAVE,
        payload: documentId
      });

      let filePath = savePath || document.filePath;

      // If no file path, show save dialog
      if (!filePath && window.electronAPI && window.electronAPI.saveFile) {
        const result = await window.electronAPI.saveFile({
          content: document.content
        });

        if (!result) {
          // User cancelled save dialog
          dispatch({
            type: EDITOR_ACTIONS.REMOVE_PENDING_SAVE,
            payload: documentId
          });
          return false;
        }

        filePath = result;
      }

      if (!filePath) {
        throw new Error('No file path provided');
      }

      dispatch({
        type: EDITOR_ACTIONS.SAVE_DOCUMENT,
        payload: { id: documentId, filePath }
      });

      // Add to recent files
      addRecentFile({
        path: filePath,
        name: document.name,
        lastOpened: new Date().toISOString()
      });

      dispatch({
        type: EDITOR_ACTIONS.UPDATE_LAST_SAVED
      });

      return true;
    } catch (error) {
      console.error('Failed to save document:', error);
      return false;
    } finally {
      dispatch({
        type: EDITOR_ACTIONS.REMOVE_PENDING_SAVE,
        payload: documentId
      });
    }
  };

  // Open document from file
  const openDocument = async (filePath) => {
    try {
      if (window.electronAPI && window.electronAPI.openFile) {
        const result = await window.electronAPI.openFile();
        if (!result) return null;

        const { filePath: openedPath, content } = result;
        const fileName = openedPath.split('/').pop() || 'Untitled';

        // Check if document is already open
        const existingDoc = state.documents.find(doc => doc.filePath === openedPath);
        if (existingDoc) {
          setActiveDocument(existingDoc.id);
          return existingDoc.id;
        }

        // Create new document
        const documentId = createNewDocument(fileName, content, openedPath);

        // Add to recent files
        addRecentFile({
          path: openedPath,
          name: fileName,
          lastOpened: new Date().toISOString()
        });

        return documentId;
      }
    } catch (error) {
      console.error('Failed to open document:', error);
      return null;
    }
  };

  // Register Quill instance
  const registerQuillInstance = (documentId, instance) => {
    dispatch({
      type: EDITOR_ACTIONS.REGISTER_QUILL_INSTANCE,
      payload: { documentId, instance }
    });
  };

  // Unregister Quill instance
  const unregisterQuillInstance = (documentId) => {
    dispatch({
      type: EDITOR_ACTIONS.UNREGISTER_QUILL_INSTANCE,
      payload: documentId
    });
  };

  // Get Quill instance for document
  const getQuillInstance = (documentId) => {
    return state.quillInstances[documentId];
  };

  // Add recent file
  const addRecentFile = (fileInfo) => {
    dispatch({
      type: EDITOR_ACTIONS.ADD_RECENT_FILE,
      payload: fileInfo
    });
  };

  // Remove recent file
  const removeRecentFile = (filePath) => {
    dispatch({
      type: EDITOR_ACTIONS.REMOVE_RECENT_FILE,
      payload: filePath
    });
  };

  // Clear recent files
  const clearRecentFiles = () => {
    dispatch({
      type: EDITOR_ACTIONS.CLEAR_RECENT_FILES
    });
  };

  // Set auto-save settings
  const setAutoSaveSettings = (enabled, delay = 2000) => {
    dispatch({
      type: EDITOR_ACTIONS.SET_AUTO_SAVE,
      payload: { enabled, delay }
    });
  };

  // Check if any document has unsaved changes
  const hasUnsavedChanges = () => {
    return state.documents.some(doc => doc.isModified);
  };

  // Get document statistics
  const getDocumentStats = (documentId) => {
    return state.documentStats[documentId] || {
      wordCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      readingTime: 0
    };
  };

  // Context value
  const contextValue = {
    // State
    documents: state.documents,
    activeDocumentId: state.activeDocumentId,
    recentFiles: state.recentFiles,
    isAutoSaveEnabled: state.isAutoSaveEnabled,
    autoSaveDelay: state.autoSaveDelay,
    lastSavedAt: state.lastSavedAt,
    pendingSaves: state.pendingSaves,

    // Getters
    getActiveDocument,
    getDocumentById,
    getQuillInstance,
    getDocumentStats,
    hasUnsavedChanges,

    // Document operations
    createNewDocument,
    closeDocument,
    setActiveDocument,
    updateDocumentContent,
    saveDocument,
    openDocument,

    // Quill management
    registerQuillInstance,
    unregisterQuillInstance,

    // Recent files
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,

    // Settings
    setAutoSaveSettings
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use editor context
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext;