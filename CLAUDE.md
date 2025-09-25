# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qnotebook is a minimalist desktop editor built with Electron and React. It provides a rich text editing experience using Quill.js with file import/export capabilities for Markdown, HTML, and text files.

## Architecture

**Frontend (React)**:
- `src/main.jsx`: Application entry point using React 18 StrictMode
- `src/App.jsx`: Main component that initializes Quill editor with Snow theme and toolbar configuration
- `src/App.css`: Styling for document-like editor layout (8.5"x11" paper simulation)

**Backend (Electron)**:
- `electron/main.js`: Main Electron process handling window creation and file operations
- `electron/preload.js`: Secure bridge exposing file dialog APIs to renderer process

**Key Dependencies**:
- `quill`: Rich text editor library (v2.0.3)
- `marked`: Markdown parser (v16.3.0)
- `turndown`: HTML to Markdown converter (v7.2.1)
- `react`: UI framework (v19.1.1)
- `electron`: Desktop application framework (v38.1.2)
- `vite`: Build tool and dev server

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Run Electron application
npm run electron

# Start both Vite dev server and Electron concurrently
npm start

# Build for production
npm run build
```

## File Operations

The application supports opening and saving files through native Electron dialogs:
- **Open**: Supports `.md`, `.html`, `.txt` files
- **Save**: Exports to `.md` (Markdown) or `.html` formats
- File operations are handled via IPC between main and renderer processes

## Editor Configuration

Quill editor is configured with Snow theme including:
- Headers (H1, H2, H3)
- Text formatting (bold, italic, underline)
- Lists (ordered, bullet)
- Links and images
- Clean formatting tool

The editor maintains a document-like appearance with:
- 8.5" width paper simulation
- 1" padding margins
- Drop shadow for paper effect
- Centered layout with scroll capability

## Development Notes

- Vite dev server runs on port 5173
- Electron loads from localhost during development
- No test framework is currently configured
- No linting or type checking is set up