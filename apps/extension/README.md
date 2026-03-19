# SmartApply Browser Extension

A Chrome extension that helps job seekers automatically extract job details and generate professional application emails using AI.

## Features

- **Job Detection**: Automatically detects job postings on LinkedIn, Indeed, Glassdoor, and other major job boards
- **Data Extraction**: Extracts job title, company, location, and requirements
- **Email Generation**: AI-powered email generation for job applications
- **Quick Actions**: Floating action button for instant access
- **Dashboard Integration**: Seamless integration with SmartApply web dashboard

## Development

### Prerequisites

- Node.js 18+
- Bun or npm package manager

### Setup

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build for production
bun run build

# Watch mode for development
bun run build:watch
```

## Structure

```
src/
├── popup/           # Extension popup UI
│   ├── index.html
│   └── popup.tsx
├── background/       # Service worker
│   └── background.ts
├── content/          # Content scripts
│   └── jobDetector.ts
└── public/           # Static assets
    ├── manifest.json
    └── icons/
```

## Building

The extension builds to `dist/` directory with:

- `popup/` - Popup files
- `background.js` - Service worker
- `content.js` - Content script
- `manifest.json` - Extension manifest

## Installation (Development)

1. Build the extension: `bun run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder

## Permissions

- `activeTab` - Access current tab
- `storage` - Store extension data
- `scripting` - Inject content scripts
- `tabs` - Manage browser tabs
- Host permissions for job boards and API

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Firefox (with manifest adaptations)

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
