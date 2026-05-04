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
    backgroundColor: "#F0F0F0",
    userSelect: "none",
};

const trashIconStyle: CSSProperties = {
    width: 30,
};

const FLOATING_UI_Z_INDEX = 999999;

const trashContainerStyle: CSSProperties = {
    position: "fixed",
    bottom: 10,
    right: 10,
    zIndex: FLOATING_UI_Z_INDEX,
};

const infoButtonContainerStyle: CSSProperties = {
    position: "fixed",
    top: 10,
    right: 10,
    zIndex: FLOATING_UI_Z_INDEX,
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
