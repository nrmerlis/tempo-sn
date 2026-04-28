import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useNotesContext } from "../context/NotesContext";
import { NOTE_COLORS, type NoteColor, type NoteRect } from "../types/notes.types";
import { FloatingCard } from "./FloatingCard";
import { InfoTooltip } from "./InfoTooltip";
import { Note } from "./Note";
import { Tooltip } from "./Tooltip";
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
    const { notes, onNoteEdit, onNoteAdd, onNoteDelete } = useNotesContext();

    const trashBucketRef = useRef<HTMLDivElement | null>(null);
    const [noteOverTrash, setNoteOverTrash] = useState<number | null>(null);

    const checkCollision = (noteRect: NoteRect): boolean => {
        if (!trashBucketRef.current) return false;
        
        const trashRect = trashBucketRef.current.getBoundingClientRect();
        
        return (
            noteRect.left < trashRect.right &&
            noteRect.right > trashRect.left &&
            noteRect.top < trashRect.bottom &&
            noteRect.bottom > trashRect.top
        );
    };

    const handleNoteDrag = (id: number, x: number, y: number, width: number, height: number) => {
        onNoteEdit({ id, x, y });
        
        const noteRect: NoteRect = {
            left: x,
            right: x + width,
            top: y,
            bottom: y + height,
        };
        
        const isOver = checkCollision(noteRect);
        setNoteOverTrash(isOver ? id : null);
    };

    const handleNoteDrop = (id: number, noteRect: NoteRect) => {
        setNoteOverTrash(null);

        if (checkCollision(noteRect)) {
            onNoteDelete({ id });
        }
    };

    const handleBoardDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;

        let x = Math.max(0, Math.min(e.clientX, window.innerWidth - DEFAULT_NOTE_SIZE));
        let y = Math.max(0, Math.min(e.clientY, window.innerHeight - DEFAULT_NOTE_SIZE));

        if (trashBucketRef.current) {
            const trashRect = trashBucketRef.current.getBoundingClientRect();
            const forbiddenLeft = trashRect.left - TRASH_MARGIN;
            const forbiddenTop = trashRect.top - TRASH_MARGIN;
            const forbiddenRight = trashRect.right + TRASH_MARGIN;
            const forbiddenBottom = trashRect.bottom + TRASH_MARGIN;

            const noteRight = x + DEFAULT_NOTE_SIZE;
            const noteBottom = y + DEFAULT_NOTE_SIZE;
            const overlaps =
                x < forbiddenRight && noteRight > forbiddenLeft &&
                y < forbiddenBottom && noteBottom > forbiddenTop;

            if (overlaps) {
                const pushUp = noteBottom - forbiddenTop;
                const pushLeft = noteRight - forbiddenLeft;
                if (pushUp <= pushLeft) {
                    y = Math.max(0, forbiddenTop - DEFAULT_NOTE_SIZE);
                } else {
                    x = Math.max(0, forbiddenLeft - DEFAULT_NOTE_SIZE);
                }
            }
        }

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
                    isOverTrash={noteOverTrash === note.id}
                    onDrag={(id, x, y) => handleNoteDrag(id, x, y, note.width, note.height)}
                    onDrop={handleNoteDrop}
                    onResize={(id, width, height) => onNoteEdit({ id, width, height })}
                    onTextEdit={(id, text) => onNoteEdit({ id, text })}
                />)
            )}

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
    )
}