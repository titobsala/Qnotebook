import { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import { useEditor } from '../contexts/EditorContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';

// Custom Quill hook for managing editor instances
export const useQuillEditor = (documentId) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const {
    getDocumentById,
    updateDocumentContent,
    registerQuillInstance,
    unregisterQuillInstance,
    getQuillInstance
  } = useEditor();
  const { getCurrentTheme } = useTheme();
  const { editor: editorSettings } = useSettings();

  // Initialize Quill editor
  useEffect(() => {
    if (!editorRef.current || !documentId) return;

    // Check if Quill is already initialized for this element
    if (editorRef.current.quill) return;

    // Create Quill configuration based on settings and theme
    const quillConfig = {
      theme: false, // Disable Snow theme to remove built-in toolbar
      modules: {
        // Remove toolbar module - we use Header menu instead
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true
        },
        clipboard: {
          matchVisual: false
        }
      },
      formats: [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align', 'direction',
        'link', 'image', 'video',
        'blockquote', 'code-block'
      ],
      placeholder: 'Start writing...',
      scrollingContainer: null,
      bounds: editorRef.current,
      debug: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
    };

    // Apply editor settings
    if (editorSettings.wordWrap === false) {
      quillConfig.modules.toolbar.container.push(['wrap']);
    }

    try {
      const quill = new Quill(editorRef.current, quillConfig);

      // Store references
      quillRef.current = quill;
      editorRef.current.quill = quill;

      // Register with editor context
      registerQuillInstance(documentId, quill);

      // Load document content
      const document = getDocumentById(documentId);
      if (document && document.content) {
        quill.clipboard.dangerouslyPasteHTML(document.content);
      }

      // Set up event listeners
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          const content = quill.root.innerHTML;
          updateDocumentContent(documentId, content);
        }
      });

      // Selection change listener for future features
      quill.on('selection-change', (range, oldRange, source) => {
        // Can be used for showing cursor position, word count at cursor, etc.
      });

      // Apply theme-specific styling
      applyThemeToEditor(quill);

    } catch (error) {
      console.error('Failed to initialize Quill editor:', error);
    }

    // Cleanup function
    return () => {
      if (quillRef.current) {
        unregisterQuillInstance(documentId);
        quillRef.current = null;
      }
      if (editorRef.current) {
        editorRef.current.quill = null;
      }
    };
  }, [documentId, registerQuillInstance, unregisterQuillInstance]);

  // Apply theme-specific styling to editor
  const applyThemeToEditor = useCallback((quill) => {
    if (!quill) return;

    const theme = getCurrentTheme();
    const editorElement = quill.root;

    // Apply theme-specific classes
    editorElement.classList.remove('theme-light', 'theme-dark');
    editorElement.classList.add(`theme-${theme.type}`);

    // Apply font settings
    if (editorSettings.fontFamily && editorSettings.fontFamily !== 'default') {
      editorElement.style.fontFamily = editorSettings.fontFamily;
    }

    if (editorSettings.fontSize) {
      editorElement.style.fontSize = `${editorSettings.fontSize}px`;
    }

    if (editorSettings.lineHeight) {
      editorElement.style.lineHeight = editorSettings.lineHeight;
    }

    // Apply cursor style
    if (editorSettings.cursorStyle === 'block') {
      editorElement.classList.add('block-cursor');
    } else {
      editorElement.classList.remove('block-cursor');
    }
  }, [getCurrentTheme, editorSettings]);

  // Update editor when theme changes
  useEffect(() => {
    if (quillRef.current) {
      applyThemeToEditor(quillRef.current);
    }
  }, [applyThemeToEditor]);

  // Update editor when document changes
  useEffect(() => {
    if (!quillRef.current || !documentId) return;

    const document = getDocumentById(documentId);
    const currentContent = quillRef.current.root.innerHTML;

    if (document && document.content !== currentContent) {
      // Update content without triggering text-change event
      quillRef.current.clipboard.dangerouslyPasteHTML(document.content);
    }
  }, [documentId, getDocumentById]);

  // Get current editor content
  const getContent = useCallback(() => {
    return quillRef.current ? quillRef.current.root.innerHTML : '';
  }, []);

  // Set editor content
  const setContent = useCallback((content) => {
    if (quillRef.current) {
      quillRef.current.clipboard.dangerouslyPasteHTML(content);
    }
  }, []);

  // Get text content without HTML
  const getText = useCallback(() => {
    return quillRef.current ? quillRef.current.getText() : '';
  }, []);

  // Focus editor
  const focus = useCallback(() => {
    if (quillRef.current) {
      quillRef.current.focus();
    }
  }, []);

  // Insert text at current cursor position
  const insertText = useCallback((text, index = null) => {
    if (quillRef.current) {
      const insertIndex = index !== null ? index : quillRef.current.getSelection()?.index || 0;
      quillRef.current.insertText(insertIndex, text);
    }
  }, []);

  // Format selected text
  const formatText = useCallback((format, value = true) => {
    if (quillRef.current) {
      const selection = quillRef.current.getSelection();
      if (selection) {
        quillRef.current.formatText(selection.index, selection.length, format, value);
      }
    }
  }, []);

  // Get current selection
  const getSelection = useCallback(() => {
    return quillRef.current ? quillRef.current.getSelection() : null;
  }, []);

  // Set selection
  const setSelection = useCallback((index, length = 0) => {
    if (quillRef.current) {
      quillRef.current.setSelection(index, length);
    }
  }, []);

  // Undo last operation
  const undo = useCallback(() => {
    if (quillRef.current) {
      quillRef.current.history.undo();
    }
  }, []);

  // Redo last undone operation
  const redo = useCallback(() => {
    if (quillRef.current) {
      quillRef.current.history.redo();
    }
  }, []);

  // Get editor bounds
  const getBounds = useCallback((index, length = 0) => {
    return quillRef.current ? quillRef.current.getBounds(index, length) : null;
  }, []);

  // Scroll editor to specific position
  const scrollIntoView = useCallback(() => {
    if (quillRef.current) {
      const selection = quillRef.current.getSelection();
      if (selection) {
        quillRef.current.scrollIntoView();
      }
    }
  }, []);

  // Enable/disable editor
  const setEnabled = useCallback((enabled) => {
    if (quillRef.current) {
      quillRef.current.enable(enabled);
    }
  }, []);

  // Update editor settings
  const updateSettings = useCallback((newSettings) => {
    if (quillRef.current) {
      // Apply settings that can be changed dynamically
      const editorElement = quillRef.current.root;

      if (newSettings.fontFamily) {
        editorElement.style.fontFamily = newSettings.fontFamily;
      }

      if (newSettings.fontSize) {
        editorElement.style.fontSize = `${newSettings.fontSize}px`;
      }

      if (newSettings.lineHeight) {
        editorElement.style.lineHeight = newSettings.lineHeight;
      }

      if (newSettings.cursorStyle) {
        if (newSettings.cursorStyle === 'block') {
          editorElement.classList.add('block-cursor');
        } else {
          editorElement.classList.remove('block-cursor');
        }
      }
    }
  }, []);

  return {
    // Refs
    editorRef,
    quillRef,

    // Content methods
    getContent,
    setContent,
    getText,

    // Selection methods
    getSelection,
    setSelection,
    focus,

    // Text manipulation
    insertText,
    formatText,

    // History
    undo,
    redo,

    // Utility
    getBounds,
    scrollIntoView,
    setEnabled,
    updateSettings
  };
};