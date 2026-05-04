import { memo, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent } from "react";
import { useNotesActions } from "../context/useNotes";
import type { Note as NoteType } from "../types/notes.types";

interface NoteProps {
    note: NoteType;
    defaultEditing: boolean;
    getTrashRect: () => DOMRect | null;
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

interface SimpleRect { left: number; top: number; right: number; bottom: number; }

const rectsOverlap = (a: SimpleRect, b: SimpleRect): boolean =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const NoteComponent = ({ note, defaultEditing, getTrashRect }: NoteProps) => {
    const { onNoteEdit, onNoteDelete, onBringToFront } = useNotesActions();

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [isTextEditing, setIsTextEditing] = useState(defaultEditing);

    const noteRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const liveRectRef = useRef({ x: note.x, y: note.y, width: note.width, height: note.height });

    // Sync committed position/size to the DOM, but skip during drag/resize
    // so direct DOM mutations (in pointermove handlers) keep ownership.
    useLayoutEffect(() => {
        const el = noteRef.current;
        if (!el) return;
        if (isDragging || isResizing) return;
        el.style.left = `${note.x}px`;
        el.style.top = `${note.y}px`;
        el.style.width = `${note.width}px`;
        el.style.height = `${note.height}px`;
        el.style.zIndex = String(note.zIndex);
    }, [note.x, note.y, note.width, note.height, note.zIndex, isDragging, isResizing]);

    const noteStyle = useMemo<CSSProperties>(() => ({
        position: "absolute",
        backgroundColor: note.color,
        boxShadow: "0 0 5px rgb(233, 232, 232)",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isOverTrash ? 0.5 : 1,
        transform: isOverTrash ? "scale(0.7)" : "scale(1)",
        transformOrigin: "center",
        transition: isDragging || isResizing ? "none" : "transform 0.2s, opacity 0.2s",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: NOTE_PADDING,
    }), [note.color, isDragging, isResizing, isOverTrash]);

    const textStyle = useMemo<CSSProperties>(() => ({
        ...baseTextStyle,
        color: note.color,
        userSelect: "none",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: Math.max(1, Math.floor((note.height - NOTE_PADDING_TOTAL) / LINE_HEIGHT_PX)),
        WebkitBoxOrient: "vertical",
        whiteSpace: "pre-wrap",
    }), [note.color, note.height]);

    const textAreaStyle = useMemo<CSSProperties>(() => ({
        ...textAreaBaseStyle,
        color: note.color,
    }), [note.color]);

    const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (isResizing || isTextEditing) return;
        setIsDragging(true);
        onBringToFront({ id: note.id });
        noteRef.current?.setPointerCapture(e.pointerId);
        dragOffsetRef.current = { x: e.clientX - note.x, y: e.clientY - note.y };
        liveRectRef.current = { x: note.x, y: note.y, width: note.width, height: note.height };
    };

    const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
        const el = noteRef.current;
        if (!el || isTextEditing) return;

        if (isDragging) {
            const rawX = e.clientX - dragOffsetRef.current.x;
            const rawY = e.clientY - dragOffsetRef.current.y;
            const newX = Math.max(0, Math.min(rawX, window.innerWidth - note.width));
            const newY = Math.max(0, Math.min(rawY, window.innerHeight - note.height));

            liveRectRef.current.x = newX;
            liveRectRef.current.y = newY;
            // Direct DOM mutation — no React re-render, no reducer dispatch.
            el.style.left = `${newX}px`;
            el.style.top = `${newY}px`;

            const trash = getTrashRect();
            if (trash) {
                const overlap = rectsOverlap(
                    { left: newX, top: newY, right: newX + note.width, bottom: newY + note.height },
                    trash,
                );
                setIsOverTrash(prev => (prev === overlap ? prev : overlap));
            }
        }

        if (isResizing) {
            const dx = e.clientX - resizeStartRef.current.x;
            const dy = e.clientY - resizeStartRef.current.y;
            const newWidth = Math.max(MIN_SIZE, resizeStartRef.current.width + dx);
            const newHeight = Math.max(MIN_SIZE, resizeStartRef.current.height + dy);
            liveRectRef.current.width = newWidth;
            liveRectRef.current.height = newHeight;
            el.style.width = `${newWidth}px`;
            el.style.height = `${newHeight}px`;
        }
    };

    const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false);
            setIsOverTrash(false);
            noteRef.current?.releasePointerCapture(e.pointerId);
            const { x, y, width, height } = liveRectRef.current;
            const trash = getTrashRect();
            const overlap = trash ? rectsOverlap(
                { left: x, top: y, right: x + width, bottom: y + height },
                trash,
            ) : false;
            if (overlap) {
                onNoteDelete({ id: note.id });
            } else if (x !== note.x || y !== note.y) {
                onNoteEdit({ id: note.id, x, y });
            }
        }

        if (isResizing) {
            setIsResizing(false);
            noteRef.current?.releasePointerCapture(e.pointerId);
            const { width, height } = liveRectRef.current;
            if (width !== note.width || height !== note.height) {
                onNoteEdit({ id: note.id, width, height });
            }
        }
    };

    const handleResizePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsResizing(true);
        onBringToFront({ id: note.id });
        noteRef.current?.setPointerCapture(e.pointerId);
        resizeStartRef.current = { x: e.clientX, y: e.clientY, width: note.width, height: note.height };
        liveRectRef.current = { x: note.x, y: note.y, width: note.width, height: note.height };
    };

    const handleTextEdit = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        onNoteEdit({ id: note.id, text: e.target.value });
    };

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
    );
};

export const Note = memo(NoteComponent);
