# Sticky Notes

A single-page sticky notes app built with React + TypeScript + Vite.

## Running the project

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

To build for production:

```bash
npm run build
```

## What you can do

- **Add a note**: double-click on the empty board. A new note appears at the cursor with a random color, ready to type.
- **Edit a note**: double-click on a note to enter text-edit mode. Click outside (or focus elsewhere) to save.
- **Move a note**: click and drag anywhere on the note.
- **Resize a note**: drag the small handle in the bottom-right corner of the note.
- **Delete a note**: drag the note onto the trash icon in the bottom-right corner of the screen.
- **Help**: hover the info icon in the top-right corner to see the action list inline.

The app rejects viewports smaller than 1024×768 with a friendly message.
