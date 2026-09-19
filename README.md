# FocusList ✦

FocusList is a playful, responsive productivity workspace for managing tasks, priorities, due dates, reminders, and workflow in one cozy Focus Room.

---

## Features

- **Task Management**: Create tasks with titles, priority levels (High, Medium, Low), and optional due dates and times.
- **In-Place Editing & Deletion**: Quick inline editing (<kbd>Enter</kbd> to save, <kbd>Escape</kbd> to cancel) and deletion.
- **Task Completion**: Instant checkbox toggle with visual completion styling.
- **Compound Search & Filtering**: Real-time title search combined with status tabs (All, Active, Completed) and priority filters.
- **Global Statistics**: Real-time counter metrics (Total, Pending, Completed) reflecting the entire dataset.
- **Sticky Board**: Pinned note cards with warm color palettes and native HTML5 Drag & Drop reordering.
- **Today's List**: Dynamic daily task strip sorted by due time; click any item to scroll and highlight it in the central workspace.
- **Kanban Flow**: Interactive 3-column board (`TODO` → `IN PROGRESS` → `DONE`) with native drag-and-drop card placement.
- **How to Use Guide & Data Controls**: In-app guide modal with quick feature walkthroughs, demo data loading, and full data reset with safety confirmation dialogs.
- **Local Storage Persistence**: 100% client-side data persistence across page reloads with defensive error handling.
- **Responsive & Mobile Ready**: Desktop single-screen room composition with an accessible slide-out mobile drawer for small screens.
- **Accessibility Aligned**: Target WCAG 2.1 AA compliant with semantic HTML5 elements, explicit `aria-label` tags, full keyboard operability, visible focus rings, and color independence.

---

## Tech Stack

- **HTML5**: Semantic document structure and accessible dialog overlays.
- **CSS3**: Warm editorial design tokens, CSS Grid, Flexbox, micro-interactions, and responsive layout.
- **TypeScript**: Strict type definitions for tasks, state snapshots, and event contracts.
- **esbuild**: Deterministic production bundling into a zero-CORS IIFE bundle (`js/app.js`).
- **Local Storage**: Zero-backend client-side persistence.
- **Native HTML5 Drag & Drop**: Smooth card and note reordering without heavy third-party dependencies.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/KrishalHaria/FocusList.git

# Navigate to project directory
cd FocusList

# Install development dependencies
npm install
```

### Running Locally

Since FocusList is a static frontend web application, you can view it directly by opening `index.html` in your browser, or using a local static file server:

```bash
# Using npx serve (or any static server)
npx serve .
```

### Build & Verification Scripts

```bash
# Typecheck TypeScript source
npm run typecheck

# Lint source files
npm run lint

# Build production bundle into js/app.js
npm run build
```

---

## Deployment

FocusList is a fully static frontend application with zero backend dependencies. It can be deployed instantly to any static hosting provider:

- **Vercel**: Import the repository directly; set the root directory to `./` (Output directory: `./`).
- **Netlify**: Set publish directory to `.`.
- **GitHub Pages / Cloudflare Pages**: Deploy directly from the main branch.

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Krishal Haria.
