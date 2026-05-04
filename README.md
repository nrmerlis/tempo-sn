# Sticky Notes

A single-page sticky notes app built with React 19 + TypeScript + Vite.

## Running the project

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # type-check + production build
npm test         # run the test suite once
npm run test:watch
npm run lint
```

The app rejects viewports smaller than 1024×768 with a friendly message.

## What you can do

### With the mouse

- **Add a note** — double-click anywhere on the board. The new note spawns at the cursor (or pushed aside if it would land on the trash) and goes straight into edit mode.
- **Edit text** — double-click a note. Click outside or press `Escape` to commit.
- **Move** — click and drag anywhere on the note.
- **Resize** — drag the small handle in the bottom-right corner.
- **Delete** — drag the note onto the trash icon in the bottom-right corner. The note shrinks and fades while it is over the drop zone.
- **Change color** — hover a note to reveal a floating swatch picker above it, then click a color.

### With the keyboard

- `Ctrl+N` — add a new note at the centre of the viewport (skipped while typing in a text input so it never steals keystrokes).
- `Tab` / `Shift+Tab` — focus the next / previous note. Focus is shown only on keyboard focus (`:focus-visible`), not on mouse clicks.
- `Arrow keys` — move the focused note 10px (`Shift+Arrow` for 50px), clamped to the viewport.
- `Enter` or `F2` — enter edit mode on the focused note.
- `Escape` — exit edit mode.
- `Delete` / `Backspace` — remove the focused note (when not editing).

The help icon in the top-right corner lists every shortcut inline.

## Architecture

The app is a single-page React 19 + TypeScript application bundled with Vite. State is owned by a `NotesProvider` built on `useReducer` and split across **two contexts**: `NotesStateContext` carries the notes plus `lastAddedId`, while `NotesActionsContext` carries stable callback references (`onNoteAdd`, `onNoteEdit`, `onNoteDelete`, `onBringToFront`). The split lets components that only dispatch — like the resize handle and color picker — never re-render on unrelated state changes. The reducer (in `src/context/notesReducer.ts`) keeps two independent counters: `nextId` for assigning ids and `nextZIndex` for stacking, so a note's position in the z-stack only changes on an explicit `BRING_TO_FRONT` (fired on `pointerdown`) and never on every drag frame.

Drag and resize are deliberately taken **out of the React render path**. While a pointer is down, `Note` keeps the live rectangle in a `useRef` and writes `style.left/top/width/height` directly to the DOM. The reducer is dispatched exactly once per interaction, on `pointerup`. That brings re-renders during a 60-fps drag from "every note, every frame" down to two or three (just the local `isDragging` and `isOverTrash` flips on the active note). `Note` is also wrapped in `React.memo` and receives its data as a `note` prop from `Board`, so the reducer's structural sharing in `state.notes.map(...)` lets unaffected notes skip rendering entirely. A small `useLayoutEffect` re-syncs the committed position from React state to the DOM whenever drag/resize ends.

Persistence lives behind the `loadFromStorage` / `saveToStorage` pair in `src/context/notesStorage.ts`. The reducer is hydrated lazily through `useReducer(reducer, undefined, init)`; subsequent state changes are flushed to `localStorage` on a 300ms debounce, with a `beforeunload` listener that synchronously persists pending changes if the user closes the tab early. The persisted payload is wrapped in a `schemaVersion` so older or corrupted blobs are rejected and the app falls back to the default state with the demo note. Counters (`nextId`, `nextZIndex`) round-trip alongside the notes, so ids never collide after a reload.

The component tree is thin and purpose-built. `App` runs `useViewportSize` and short-circuits to `UnsupportedViewport` below 1024×768; otherwise it renders the `Board`, which owns the work surface, the floating UI (trash, help icon), and a global `Ctrl+N` keydown listener that spawns a note at the viewport centre. The "spawn position" logic — clamping to the viewport and pushing the new note out of the trash forbidden zone — is extracted as a pure `clampNoteSpawnPosition` helper for testability. Trash collision is detected from inside `Note` itself: `Board` exposes a stable `getTrashRect` callback, the active note reads the rect on every move, and toggles a local `isOverTrash` state that drives the visual feedback (scale 0.7 + opacity 0.5). Stacking-wise, normal notes sit below `TRASH_Z_INDEX`; a dragged note is bumped above it via `DRAGGING_Z_INDEX` so the user can see what they are dropping; the help icon stays on top via `INFO_Z_INDEX`.

Accessibility is built into the components rather than bolted on. Each note is a focusable `role="article"` with a dynamic `aria-label`, supports the full keyboard contract above, and respects `prefers-reduced-motion` (rotation, hover lift, and CSS transitions are all disabled when set, via the `useReducedMotion` hook). The board itself is `role="application"`. `:focus-visible` from `index.css` is the only piece of stylesheet CSS in the project; everything else is typed inline `CSSProperties` to keep colocation tight.

Reusable presentational primitives — `FloatingCard` (the white, shadowed surface shared by trash and help) and `Tooltip` (hover-driven, placement-aware) — are stateless beyond local hover state, and `InfoTooltip` composes both into the help affordance. The color picker is its own `ColorPicker` component, rendered as a child of the un-rotated outer container so the pill stays horizontal even when the paper inside is tilted; an invisible padding band on the wrapper bridges the visual gap between the pill and the note so `pointerleave` only fires when the cursor genuinely leaves both regions.

## Testing

Vitest runs in jsdom and covers the non-trivial pure logic.

```bash
npm test
```

The suite (in `tests/`) includes:

- **`notesReducer`** — every action including the `BRING_TO_FRONT` early-out and unknown-id no-ops. The "preserves references for unaffected notes" test pins down the property `React.memo` relies on.
- **`notesStorage`** — round-trip, empty storage, corrupt JSON, schema-version mismatch, missing fields, and the empty-array (intentional clear) case.
- **`clampNoteSpawnPosition`** — viewport clamping at all four edges, the no-trash branch, both push-up and push-left avoidance branches, and the corner case where pushing up would go negative.

The `Note` component itself is covered by the visual smoke test in dev plus the targeted reducer/helper tests; full pointer-event integration in jsdom would require additional shims (`setPointerCapture`, `getBoundingClientRect`) and is out of scope for this iteration.

## File layout

```
src/
  App.tsx                          short-circuits to UnsupportedViewport or Board
  components/
    Board.tsx                      surface + floating UI + global Ctrl+N
    Note.tsx                       per-note container with pointer + keyboard interactions
    ColorPicker.tsx                hover-revealed pill of swatches
    FloatingCard.tsx               white shadowed surface primitive
    Tooltip.tsx                    placement-aware hover overlay
    InfoTooltip.tsx                Mouse + Keyboard help content
    UnsupportedViewport.tsx        message for tiny screens
    boardHelpers.ts                pure clampNoteSpawnPosition
  context/
    NotesContext.tsx               provider, hydration, debounced persistence
    notesReducer.ts                reducer + default state
    notesStorage.ts                load/save with schema versioning
    useNotes.ts                    contexts + useNotesState / useNotesActions hooks
  hooks/
    useViewportSize.ts             tracks the 1024x768 minimum
    useReducedMotion.ts            subscribes to prefers-reduced-motion
  types/notes.types.ts             Note, NoteColor, NotesAction discriminated union
tests/                             vitest specs mirroring the src/ layout
```
