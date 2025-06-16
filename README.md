# Chrome Extension Boilerplate with Proxy

Modern Chrome/Firefox extension boilerplate using React, TypeScript, and Vite.

## Quick Start

### Prerequisites
- Node.js >= 22.15.1
- pnpm: `npm install -g pnpm`

### Installation
```bash
pnpm install
```

### Development Commands
```bash
# Development
pnpm dev           # Chrome development mode
pnpm dev:firefox   # Firefox development mode

# Build
pnpm build         # Chrome production build
pnpm build:firefox # Firefox production build

# Quality Check
pnpm lint          # Run ESLint
pnpm type-check    # Run TypeScript check
pnpm format        # Run Prettier

# Testing
pnpm e2e           # Run E2E tests
pnpm zip           # Create extension package
```

### Chrome Extension Installation

1. **Development Mode**:
   ```bash
   pnpm dev
   ```

2. **Install Extension**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

3. **Production Build**:
   ```bash
   pnpm build
   pnpm zip  # Creates packaged extension
   ```

### Firefox Installation

1. **Development Mode**:
   ```bash
   pnpm dev:firefox
   ```

2. **Install Extension**:
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select `./dist/manifest.json`

## Tech Stack

- **React** 19.1.0 - UI framework
- **TypeScript** 5.8.3 - Type safety
- **Vite** 6.3.5 - Build tool
- **Turborepo** 2.5.3 - Monorepo management
- **Tailwind CSS** 3.4.17 - Styling
- **Chrome Extensions Manifest V3** - Extension platform
- **WebdriverIO** - E2E testing

## Project Structure

```
chrome-extension-with-proxy/
├── chrome-extension/      # Extension manifest and background scripts
├── pages/                # UI pages (popup, options, content scripts)
├── packages/             # Shared packages (storage, i18n, ui, etc.)
└── tests/               # E2E tests
```

## Package Management

### Install Dependencies
```bash
# Root level
pnpm i <package> -w

# Specific module
pnpm i <package> -F <module-name>
```

### Update Version
```bash
pnpm update-version <version>
```

## Key Features

- **Multiple Extension Pages**: popup, options, new-tab, side-panel, devtools
- **Content Scripts**: Inject React components into web pages
- **Hot Module Reload**: Custom HMR for fast development
- **Internationalization**: Built-in i18n support
- **Storage Helpers**: Simplified Chrome storage API
- **E2E Testing**: WebdriverIO integration

## Troubleshooting

### Common Issues
- **HMR frozen**: Restart with `Ctrl+C` then `pnpm dev`
- **GRPC error**: Kill turbo process and run `pnpm dev` again
- **WSL import issues**: Connect VS Code to WSL remotely

### Windows Users
Run `pnpm dev` as administrator. Ensure WSL is enabled.

## Documentation

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).

## License

MIT
