// Application Constants

export const THEMES = {
  // Light Themes
  LIGHT: {
    id: 'light',
    name: 'Light',
    type: 'light',
    description: 'Clean light theme'
  },
  LIGHT_MINIMAL: {
    id: 'light-minimal',
    name: 'Minimal',
    type: 'light',
    description: 'Pure white minimal'
  },
  LIGHT_WARM: {
    id: 'light-warm',
    name: 'Cream',
    type: 'light',
    description: 'Warm cream tones'
  },
  GITHUB_LIGHT: {
    id: 'github-light',
    name: 'GitHub',
    type: 'light',
    description: 'GitHub-inspired'
  },

  // Dark Themes
  DARK: {
    id: 'dark',
    name: 'Dark',
    type: 'dark',
    description: 'Standard dark theme'
  },
  DARK_PROFESSIONAL: {
    id: 'dark-professional',
    name: 'Pro Dark',
    type: 'dark',
    description: 'Professional dark'
  },
  DARK_DEEP: {
    id: 'dark-deep',
    name: 'Deep',
    type: 'dark',
    description: 'OLED-friendly black'
  },
  DARK_NORD: {
    id: 'dark-nord',
    name: 'Nord',
    type: 'dark',
    description: 'Arctic-inspired'
  },
  DRACULA: {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    description: 'Purple-accented'
  },

  // Accessibility Themes
  HIGH_CONTRAST_LIGHT: {
    id: 'high-contrast-light',
    name: 'High Contrast',
    type: 'light',
    description: 'Better accessibility',
    accessibility: true
  },
  HIGH_CONTRAST_DARK: {
    id: 'high-contrast-dark',
    name: 'HC Dark',
    type: 'dark',
    description: 'Accessible dark',
    accessibility: true
  },

  // Specialty Themes
  SEPIA: {
    id: 'sepia',
    name: 'Sepia',
    type: 'light',
    description: 'Warm sepia tones',
    specialty: true
  },
  FOCUS: {
    id: 'focus',
    name: 'Focus',
    type: 'light',
    description: 'Distraction-free',
    specialty: true
  },
  EYE_COMFORT: {
    id: 'eye-comfort',
    name: 'Eye Care',
    type: 'light',
    description: 'Reduced blue light',
    specialty: true
  },
  PRINT_PREVIEW: {
    id: 'print-preview',
    name: 'Print',
    type: 'light',
    description: 'Print optimized',
    hidden: true
  }
};

// Theme Collections
export const THEME_COLLECTIONS = {
  LIGHT_THEMES: [
    THEMES.LIGHT,
    THEMES.LIGHT_MINIMAL,
    THEMES.LIGHT_WARM,
    THEMES.GITHUB_LIGHT
  ],
  DARK_THEMES: [
    THEMES.DARK,
    THEMES.DARK_PROFESSIONAL,
    THEMES.DARK_DEEP,
    THEMES.DARK_NORD,
    THEMES.DRACULA
  ],
  ACCESSIBILITY_THEMES: [
    THEMES.HIGH_CONTRAST_LIGHT,
    THEMES.HIGH_CONTRAST_DARK
  ],
  SPECIALTY_THEMES: [
    THEMES.SEPIA,
    THEMES.FOCUS,
    THEMES.EYE_COMFORT
  ]
};

// Get all visible themes (excluding hidden ones)
export const getAllThemes = () => {
  return Object.values(THEMES).filter(theme => !theme.hidden);
};

// Get themes by type
export const getThemesByType = (type) => {
  return Object.values(THEMES).filter(theme => theme.type === type && !theme.hidden);
};

// Default Settings
export const DEFAULT_SETTINGS = {
  // Theme Settings
  theme: THEMES.LIGHT.id,
  autoThemeSwitch: false,
  systemThemeSync: true,
  customThemeColors: {},

  // Editor Settings
  editor: {
    fontSize: 16,
    fontFamily: 'default', // Uses CSS custom property
    lineHeight: 1.5,
    wordWrap: true,
    showLineNumbers: false,
    showMinimap: false,
    cursorStyle: 'line'
  },

  // Layout Settings
  layout: {
    showSidebar: true,
    sidebarWidth: 256,
    showStatusBar: true,
    showToolbar: true,
    compactMode: false
  },

  // File Settings
  files: {
    autoSave: true,
    autoSaveDelay: 2000, // 2 seconds
    createBackups: true,
    maxRecentFiles: 20,
    defaultFileFormat: 'md'
  },

  // Writing Settings
  writing: {
    spellCheck: true,
    wordCount: true,
    readingTime: true,
    focusMode: false,
    distractionFree: false
  },

  // Performance Settings
  performance: {
    enableVirtualScrolling: true,
    lazyLoadImages: true,
    maxDocumentSize: 10 // MB
  }
};

// Application Metadata
export const APP_INFO = {
  name: 'Qnotebook',
  version: '1.0.0',
  description: 'A minimalist desktop editor',
  author: '',
  homepage: 'https://github.com/titobsala/Qnotebook'
};

// File Extensions and Types
export const SUPPORTED_FILE_TYPES = {
  markdown: {
    extensions: ['.md', '.markdown', '.mdown', '.mkd'],
    mimeType: 'text/markdown',
    icon: 'markdown',
    name: 'Markdown'
  },
  html: {
    extensions: ['.html', '.htm'],
    mimeType: 'text/html',
    icon: 'html',
    name: 'HTML'
  },
  text: {
    extensions: ['.txt'],
    mimeType: 'text/plain',
    icon: 'text',
    name: 'Plain Text'
  },
  json: {
    extensions: ['.json'],
    mimeType: 'application/json',
    icon: 'json',
    name: 'JSON'
  }
};

// Export formats
export const EXPORT_FORMATS = {
  pdf: {
    name: 'PDF Document',
    extension: '.pdf',
    mimeType: 'application/pdf',
    description: 'Portable Document Format'
  },
  docx: {
    name: 'Word Document',
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Microsoft Word Document'
  },
  html: {
    name: 'HTML Document',
    extension: '.html',
    mimeType: 'text/html',
    description: 'HyperText Markup Language'
  },
  markdown: {
    name: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
    description: 'Markdown Document'
  }
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  // File Operations
  NEW_FILE: 'Ctrl+N',
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  CLOSE_TAB: 'Ctrl+W',

  // Edit Operations
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  CUT: 'Ctrl+X',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  SELECT_ALL: 'Ctrl+A',

  // Search Operations
  FIND: 'Ctrl+F',
  FIND_REPLACE: 'Ctrl+H',
  FIND_IN_FILES: 'Ctrl+Shift+F',

  // View Operations
  TOGGLE_SIDEBAR: 'Ctrl+B',
  TOGGLE_PREVIEW: 'Ctrl+Shift+V',
  TOGGLE_THEME: 'Ctrl+Shift+T',
  ZOOM_IN: 'Ctrl+Plus',
  ZOOM_OUT: 'Ctrl+Minus',
  ZOOM_RESET: 'Ctrl+0',

  // Navigation
  GO_TO_LINE: 'Ctrl+G',
  NEXT_TAB: 'Ctrl+Tab',
  PREVIOUS_TAB: 'Ctrl+Shift+Tab',

  // Settings
  OPEN_SETTINGS: 'Ctrl+Comma'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'qnotebook-theme',
  SETTINGS: 'qnotebook-settings',
  RECENT_FILES: 'qnotebook-recent-files',
  WINDOW_STATE: 'qnotebook-window-state',
  CUSTOM_THEMES: 'qnotebook-custom-themes',
  WORKSPACES: 'qnotebook-workspaces',
  EDITOR_STATE: 'qnotebook-editor-state'
};

// CSS Custom Property Names (for dynamic theme updates)
export const CSS_VARIABLES = {
  // Colors
  COLOR_PRIMARY: '--color-primary',
  COLOR_BG_PRIMARY: '--color-bg-primary',
  COLOR_BG_SECONDARY: '--color-bg-secondary',
  COLOR_TEXT_PRIMARY: '--color-text-primary',
  COLOR_TEXT_SECONDARY: '--color-text-secondary',
  COLOR_BORDER_PRIMARY: '--color-border-primary',

  // Typography
  FONT_SIZE_BASE: '--font-size-base',
  FONT_FAMILY_UI: '--font-family-ui',
  FONT_FAMILY_EDITOR: '--font-family-editor',
  LINE_HEIGHT_NORMAL: '--line-height-normal',

  // Layout
  HEADER_HEIGHT: '--header-height',
  SIDEBAR_WIDTH: '--sidebar-width',
  STATUSBAR_HEIGHT: '--statusbar-height'
};

// Animation and Transition Constants
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Validation Rules
export const VALIDATION = {
  THEME_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/
  },
  FILE_NAME: {
    MAX_LENGTH: 255,
    INVALID_CHARS: /[<>:"/\\|?*]/
  },
  FONT_SIZE: {
    MIN: 8,
    MAX: 72
  }
};