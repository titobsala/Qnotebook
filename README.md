# QuillDE

A minimalist desktop editor built with React, Electron, and Quill.js. QuillDE provides a clean, distraction-free writing environment with modern features and customizable themes.

## Features

- 🖊️ **Rich Text Editing** - Powered by Quill.js for a smooth writing experience
- 🎨 **Multiple Themes** - 10+ built-in themes including light, dark, and high-contrast modes
- 📁 **Document Management** - Create, open, save, and manage multiple documents
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support
- 💾 **Auto-save** - Never lose your work with automatic saving
- 🖥️ **Cross-Platform** - Available as both desktop app (Electron) and web app


## Tech Stack

- **Frontend**: React 19.1.1 with Context API
- **Desktop**: Electron 38.1.2
- **Editor**: Quill.js 2.0.3
- **Build Tool**: Vite 7.1.7
- **Styling**: CSS Custom Properties with theming system

## Installation

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Clone and Install

```bash
git clone https://github.com/titobsala/QuillDE.git
cd QuillDE
npm install
```

## Development

### Web Development
Run the web version with hot reload:
```bash
npm run dev
```
Then open http://localhost:5174 in your browser.

### Electron Development
Run the desktop app with hot reload:
```bash
npm start
```
This starts both the Vite dev server and Electron app concurrently.

### Building

Build for production:
```bash
npm run build
```

Build Electron app:
```bash
npm run electron:build
```

## Usage

### Keyboard Shortcuts

#### File Operations
- `Ctrl+N` - New Document
- `Ctrl+O` - Open Document
- `Ctrl+S` - Save Document
- `Ctrl+Shift+S` - Save As
- `Ctrl+P` - Print

#### Editing
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+X` - Cut
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+F` - Find
- `Ctrl+H` - Replace

#### View
- `Ctrl+B` - Toggle Sidebar
- `Ctrl++` - Zoom In
- `Ctrl+-` - Zoom Out
- `Ctrl+0` - Reset Zoom

#### Window (Desktop only)
- `F11` - Toggle Fullscreen
- `Ctrl+M` - Minimize
- `Ctrl+W` - Close Window

### Theme Customization

QuillDE includes multiple built-in themes:
- **Light** - Clean light theme (default)
- **Dark** - Dark theme for low-light environments
- **Blue** - Professional blue theme
- **Green** - Nature-inspired green theme
- **Purple** - Creative purple theme
- **High Contrast** - Accessibility-focused themes
- **Focus** - Distraction-free writing mode
- **Print Preview** - Optimized for printing

Access themes via the theme toggle button in the header or the sidebar theme panel.

## Architecture

QuillDE follows a modular architecture with clear separation of concerns:

```
src/
├── components/          # React components
│   ├── Editor/         # Editor-related components
│   ├── Layout/         # Layout components (Header, Sidebar, etc.)
│   └── UI/             # Reusable UI components
├── contexts/           # React contexts for state management
│   ├── EditorContext   # Document and editor state
│   ├── ThemeContext    # Theme management
│   └── SettingsContext # Application settings
├── hooks/              # Custom React hooks
├── styles/             # CSS files and themes
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Follow the existing code style and patterns
5. Test your changes in both web and Electron modes
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Use functional components with hooks
- Follow React best practices
- Maintain consistency with existing UI patterns
- Ensure accessibility compliance
- Test on both web and Electron versions
- Write semantic, accessible HTML

## Project Structure

```
QuillDE/
├── electron/           # Electron main process files
├── public/             # Static assets
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── styles/
│   └── utils/
├── docs/               # Documentation assets
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Scripts

- `npm run dev` - Start Vite dev server (web only)
- `npm start` - Start Electron app with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron` - Start Electron (requires built files)
- `npm run electron:build` - Build Electron app

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## Support

- 🐛 [Report Issues](https://github.com/titobsala/QuillDE/issues)


## Acknowledgments

- [Quill.js](https://quilljs.com/) - Rich text editor
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

---

Built with ❤️ by [Tito Sala](https://github.com/titobsala)