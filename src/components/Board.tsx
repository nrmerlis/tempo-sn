import { useCallback, useRef, type CSSProperties, type MouseEvent } from "react";
import { useNotesActions, useNotesState } from "../context/useNotes";
import { NOTE_COLORS, type NoteColor } from "../types/notes.types";
import { FloatingCard } from "./FloatingCard";
import { InfoTooltip } from "./InfoTooltip";
import { Note } from "./Note";
import { Tooltip } from "./Tooltip";
import { clampNoteSpawnPosition } from "./boardHelpers";
import trashIcon from "../assets/trash.svg";

const boardStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "#F4F1EA",
    backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    userSelect: "none",
    overflow: "hidden",
};

const emptyStateStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "rgba(0, 0, 0, 0.4)",
    fontSize: 20,
    fontFamily: "system-ui, sans-serif",
    fontWeight: 500,
    pointerEvents: "none",
    textAlign: "center",
};

const trashIconStyle: CSSProperties = {
    width: 30,
};

// Stacking order, from bottom to top:
//   normal notes (small zIndex from the reducer counter)
//   < TRASH_Z_INDEX
//   < DRAGGING_Z_INDEX (in Note.tsx; lifted only while a note is being dragged)
//   < INFO_Z_INDEX
// This way: a dragged note flies above the trash so the user can see it,
// but the help icon always stays on top of any note.
const TRASH_Z_INDEX = 999_998;
const INFO_Z_INDEX = 1_000_001;

const trashContainerStyle: CSSProperties = {
    position: "fixed",
    bottom: 10,
    right: 10,
    zIndex: TRASH_Z_INDEX,
};

const infoButtonContainerStyle: CSSProperties = {
    position: "fixed",
    top: 10,
    right: 10,
    zIndex: INFO_Z_INDEX,
};

const DEFAULT_NOTE_SIZE = 200;
const TRASH_MARGIN = 20;

const randomNoteColor = (): NoteColor =>
    NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

export const Board = () => {
    const { notes, lastAddedId } = useNotesState();
    const { onNoteAdd } = useNotesActions();

    const trashBucketRef = useRef<HTMLDivElement | null>(null);

    const getTrashRect = useCallback((): DOMRect | null => {
        return trashBucketRef.current?.getBoundingClientRect() ?? null;
    }, []);

    const handleBoardDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;

        const { x, y } = clampNoteSpawnPosition({
            rawX: e.clientX,
            rawY: e.clientY,
            noteSize: DEFAULT_NOTE_SIZE,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            trashRect: getTrashRect(),
            trashMargin: TRASH_MARGIN,
        });

        onNoteAdd({
            x,
            y,
            width: DEFAULT_NOTE_SIZE,
            height: DEFAULT_NOTE_SIZE,
            text: "",
            color: randomNoteColor(),
        });
    };

    return (
        <div style={boardStyle} onDoubleClick={handleBoardDoubleClick}>
            {notes.length === 0 && (
                <div style={emptyStateStyle}>Double-click anywhere to add a note</div>
            )}

            {notes.map(note => (
                <Note
                    key={note.id}
                    note={note}
                    defaultEditing={lastAddedId === note.id}
                    getTrashRect={getTrashRect}
                />
            ))}

            <div style={trashContainerStyle}>
                <Tooltip content="Drag a note here to delete it" placement="top">
                    <FloatingCard ref={trashBucketRef}>
                        <img style={trashIconStyle} src={trashIcon} alt="Trash" />
                    </FloatingCard>
                </Tooltip>
            </div>

            <div style={infoButtonContainerStyle}>
                <InfoTooltip />
            </div>
        </div>
    );
};
