# Postboy

A lightweight cross-platform HTTP client for API testing, built with Electron and React.

## ScreenShot
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/f643e0fa-b5ef-4e5f-af8d-ad05fcc34780" />
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/4117c93c-d759-4bdc-961e-66dad48219f7" />


## Features

- 🚀 Fast and lightweight
- 🎨 Modern, intuitive UI
- 📁 Organize requests in collections
- 💾 Local SQLite database
- 🔄 Import/Export collections
- 🖥️ Cross-platform (Windows & macOS)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Option 1: Development mode with hot-reload (requires Vite)
npm run dev

# Option 2: Build and run (no hot-reload, faster startup)
npm start
```

- `npm run dev`: Starts Vite dev server + Electron with hot-reload
- `npm start`: Builds once and runs Electron (faster, no Vite needed)

### Building

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for all platforms
npm run build:all
```

Built packages will be in the `release/` directory.



## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Electron 39, Node.js
- **Database**: SQLite (better-sqlite3)
- **Build**: Vite, electron-builder
- **Code Editor**: Monaco Editor

## Project Structure

```
postboy/
├── src/                 # React frontend
├── electron/            # Electron main process
├── public/              # Static assets
├── build/               # Build resources (icons)
└── release/             # Built packages (generated)
```

## Requirements

- Node.js 18+
- npm 9+

## Platform Support

- ✅ Windows 10/11 (x64, ARM64)
- ✅ macOS 11+ (Intel, Apple Silicon)

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.
