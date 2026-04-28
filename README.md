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

## Architecture

The app is a single-page React 19 + TypeScript application bundled with Vite, with no backend or persistence — state lives entirely in memory and resets on reload. All note data (position, size, text, color, stacking order) is centralised in a `NotesProvider` built on React Context plus `useReducer`, which exposes three actions (`ADD_NOTE`, `EDIT_NOTE`, `DELETE_NOTE`) and a `lastAddedId` flag used to auto-focus a freshly created note. Every drag, resize, text edit and delete dispatches one of these actions, making the reducer the single source of truth; `zIndex` is bumped on every edit so the most recently touched note rises to the front.

The component tree is thin and purpose-built. `App` first runs the `useViewportSize` hook and short-circuits to `UnsupportedViewport` below 1024×768; otherwise it renders the `Board`, which owns the work surface and the floating UI (trash bucket, help icon). `Board` handles double-click to spawn notes — clamped inside the viewport and nudged away from the trash — and runs trash collision detection by reading the trash element's bounding rect through a `ref` and comparing it against the dragged note's rectangle (AABB). Each `Note` is self-contained for input: it uses the Pointer Events API with `setPointerCapture` so drag and resize keep working when the pointer leaves the element, and reports back through `onDrag` / `onDrop` / `onResize` / `onTextEdit` callbacks that translate into reducer actions.

Reusable presentational primitives — `FloatingCard` (the white, shadowed surface shared by the trash and help icons) and `Tooltip` (a hover-driven, placement-aware overlay) — are stateless beyond local hover state, and `InfoTooltip` composes both into the help affordance. Styling is done entirely with typed inline `CSSProperties` objects (no CSS framework), and the domain types — including the discriminated `NotesAction` union and the `Note` shape — are concentrated in `src/types/notes.types.ts` to keep the reducer and its consumers in lockstep.
