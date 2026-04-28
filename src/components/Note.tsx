import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Note as NoteType, NoteRect } from "../types/notes.types"
import { useNotesContext } from "../context/NotesContext";

interface NoteProps {
    note: NoteType;
    isOverTrash: boolean;
    onDrag: (id: number, x: number, y: number) => void;
    onDrop: (id: number, noteRect: NoteRect) => void;
    onResize: (id: number, width: number, height: number) => void;
    onTextEdit: (id: number, text: string) => void;
}

const MIN_SIZE = 50;
const NOTE_PADDING = 8;
const NOTE_PADDING_TOTAL = NOTE_PADDING * 2;
const LINE_HEIGHT_PX = 24;

const resizeHandleStyle: CSSProperties = {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    cursor: "nwse-resize",
    backgroundColor: "#b1b0b0",
    borderRadius: "2px",
};

const baseTextStyle: CSSProperties = {
    filter: "invert(100%)",
    margin: 0,
    padding: 0,
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "100%",
    fontSize: "inherit",
    fontFamily: "inherit",
    lineHeight: "1.4",
};

const textAreaBaseStyle: CSSProperties = {
    ...baseTextStyle,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    resize: "none",
    maxHeight: "100%",
    boxSizing: "border-box",
    overflow: "auto",
    fieldSizing: "content",
};

export const Note = ({ note, isOverTrash, onDrag, onDrop, onResize, onTextEdit }: NoteProps) => {
    const { lastAddedId } = useNotesContext();
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isTextEditing, setIsTextEditing] = useState(lastAddedId === note.id);

    const noteRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 0, height: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });

    const noteStyle = useMemo<CSSProperties>(() => ({
        width: note.width,
        height: note.height,
        position: "absolute",
        top: note.y,
        left: note.x,
        zIndex: note.zIndex,
        backgroundColor: note.color,
        boxShadow: "0 0 5px rgb(233, 232, 232)",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isOverTrash ? 0.5 : 1,
        transform: isOverTrash ? "scale(0.7)" : "scale(1)",
        transition: "transform 0.2s, opacity 0.2s",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: NOTE_PADDING,
    }), [note, isDragging, isOverTrash]);

    const textStyle = useMemo<CSSProperties>(() => ({
        ...baseTextStyle,
        color: note.color,
        userSelect: "none",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: Math.max(1, Math.floor((note.height - NOTE_PADDING_TOTAL) / LINE_HEIGHT_PX)), // Max visible lines based on note height
        WebkitBoxOrient: "vertical",
        whiteSpace: "pre-wrap",
    }), [note.color, note.height]);

    const textAreaStyle = useMemo<CSSProperties>(() => ({
        ...textAreaBaseStyle,
        color: note.color,
    }), [note.color]);

    const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (isResizing) return;
        setIsDragging(true);
        noteRef.current?.setPointerCapture(e.pointerId);
        // Store click offset relative to note position
        offsetRef.current = { x: e.clientX - note.x, y: e.clientY - note.y };
    }

    const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {

        if (isTextEditing) return;

        if (isDragging) {
            const rawX = e.clientX - offsetRef.current.x;
            const rawY = e.clientY - offsetRef.current.y;
            // Clamp position within viewport bounds
            const newX = Math.max(0, Math.min(rawX, window.innerWidth - note.width));
            const newY = Math.max(0, Math.min(rawY, window.innerHeight - note.height));
            onDrag(note.id, newX, newY);
        }
        
        if (isResizing) {
            // Calculate size delta from initial resize position
            const deltaX = e.clientX - startPosRef.current.x;
            const deltaY = e.clientY - startPosRef.current.y;
            const newWidth = Math.max(MIN_SIZE, initialSizeRef.current.width + deltaX);
            const newHeight = Math.max(MIN_SIZE, initialSizeRef.current.height + deltaY);
            onResize(note.id, newWidth, newHeight);
        }
    }

    const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false);
            noteRef.current?.releasePointerCapture(e.pointerId);
            onDrop(note.id, {
                left: note.x,
                right: note.x + note.width,
                top: note.y,
                bottom: note.y + note.height,
            });
        }
        
        if (isResizing) {
            setIsResizing(false);
            noteRef.current?.releasePointerCapture(e.pointerId);
        }
    }

    const handleResizePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsResizing(true);
        noteRef.current?.setPointerCapture(e.pointerId);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        initialSizeRef.current = { width: note.width, height: note.height };
    }

    const handleTextEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        onTextEdit(note.id, e.target.value);
    }

    return (
        <div
            ref={noteRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onDoubleClick={() => setIsTextEditing(true)}
            style={noteStyle}
        >
            {!isTextEditing && <p style={textStyle}>{note.text}</p>}
            {isTextEditing && (
                <textarea 
                    style={textAreaStyle}
                    value={note.text} 
                    onChange={handleTextEdit} 
                    onBlur={() => setIsTextEditing(false)} 
                    autoFocus 
                />
            )}
            <div 
                style={resizeHandleStyle}
                onPointerDown={handleResizePointerDown}
            />
        </div>
    )
}
