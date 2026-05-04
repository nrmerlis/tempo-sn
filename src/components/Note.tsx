import { memo, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useNotesActions } from "../context/useNotes";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { NOTE_TEXT_COLOR, type NoteColor, type Note as NoteType } from "../types/notes.types";
import { ColorPicker } from "./ColorPicker";

interface NoteProps {
    note: NoteType;
    defaultEditing: boolean;
    getTrashRect: () => DOMRect | null;
}

const MIN_SIZE = 50;
const NOTE_PADDING = 12;
const NOTE_PADDING_TOTAL = NOTE_PADDING * 2;
const LINE_HEIGHT_PX = 28;
const NOTE_FONT_SIZE = 20;
const ROTATION_RANGE_DEG = 1.5;
const KEYBOARD_STEP = 10;
const KEYBOARD_STEP_LARGE = 50;

// Must sit between TRASH_Z_INDEX and INFO_Z_INDEX defined in Board.tsx so
// a dragged note renders in front of the trash bucket but stays behind
// the help icon.
const DRAGGING_Z_INDEX = 1_000_000;

// Deterministic small rotation per note id, golden-ratio scattered so
// adjacent ids look obviously different.
const noteRotation = (id: number): number =>
    (((id + 1) * 137.508) % (ROTATION_RANGE_DEG * 2)) - ROTATION_RANGE_DEG;

const containerStyle: CSSProperties = {
    position: "absolute",
};

const cornerFoldStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    background: "linear-gradient(45deg, transparent 50%, rgba(0, 0, 0, 0.08) 50%)",
    borderTopRightRadius: 4,
    pointerEvents: "none",
};

const resizeHandleStyle: CSSProperties = {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    cursor: "nwse-resize",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: "2px",
};

const baseTextStyle: CSSProperties = {
    color: NOTE_TEXT_COLOR,
    margin: 0,
    padding: 0,
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "100%",
    fontSize: NOTE_FONT_SIZE,
    fontFamily: "'Caveat', 'Patrick Hand', system-ui, sans-serif",
    lineHeight: 1.3,
};

const textAreaBaseStyle: CSSProperties = {
    ...baseTextStyle,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    resize: "none",
    maxHeight: "100%",
    width: "100%",
    boxSizing: "border-box",
    overflow: "auto",
    fieldSizing: "content",
};

const readOnlyTextStyle: CSSProperties = {
    ...baseTextStyle,
    userSelect: "none",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    whiteSpace: "pre-wrap",
};

interface SimpleRect { left: number; top: number; right: number; bottom: number; }

const rectsOverlap = (a: SimpleRect, b: SimpleRect): boolean =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const NoteComponent = ({ note, defaultEditing, getTrashRect }: NoteProps) => {
    const { onNoteEdit, onNoteDelete, onBringToFront } = useNotesActions();
    const reducedMotion = useReducedMotion();

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [isTextEditing, setIsTextEditing] = useState(defaultEditing);
    const [isHovered, setIsHovered] = useState(false);

    const noteRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const liveRectRef = useRef({ x: note.x, y: note.y, width: note.width, height: note.height });

    const rotation = useMemo(
        () => (reducedMotion ? 0 : noteRotation(note.id)),
        [note.id, reducedMotion],
    );

    // Sync committed position/size to the outer container, but skip during
    // drag/resize so direct DOM mutations (in pointermove handlers) keep
    // ownership.
    useLayoutEffect(() => {
        const el = noteRef.current;
        if (!el) return;
        if (isDragging || isResizing) {
            // Lift the active note above the floating UI (trash, help icon).
            el.style.zIndex = String(DRAGGING_Z_INDEX);
            return;
        }
        el.style.left = `${note.x}px`;
        el.style.top = `${note.y}px`;
        el.style.width = `${note.width}px`;
        el.style.height = `${note.height}px`;
        el.style.zIndex = String(note.zIndex);
    }, [note.x, note.y, note.width, note.height, note.zIndex, isDragging, isResizing]);

    const isInteracting = isDragging || isResizing || isTextEditing;
    const showLift = isHovered && !isInteracting && !isOverTrash && !reducedMotion;

    const paperStyle = useMemo<CSSProperties>(() => {
        const transformParts: string[] = [`rotate(${rotation}deg)`];
        if (isOverTrash) transformParts.push("scale(0.7)");
        else if (showLift) transformParts.push("translateY(-2px)");

        return {
            position: "absolute",
            inset: 0,
            backgroundColor: note.color,
            boxShadow: showLift
                ? "0 8px 18px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.10)"
                : "0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)",
            cursor: isDragging ? "grabbing" : "grab",
            opacity: isOverTrash ? 0.5 : 1,
            transform: transformParts.join(" "),
            transformOrigin: "center",
            transition: isInteracting || reducedMotion
                ? "none"
                : "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: NOTE_PADDING,
            boxSizing: "border-box",
        };
    }, [note.color, isDragging, isInteracting, isOverTrash, showLift, rotation, reducedMotion]);

    const textStyle = useMemo<CSSProperties>(() => ({
        ...readOnlyTextStyle,
        WebkitLineClamp: Math.max(1, Math.floor((note.height - NOTE_PADDING_TOTAL) / LINE_HEIGHT_PX)),
    }), [note.height]);

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

    const handleTextAreaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const handleColorChange = (color: NoteColor) => {
        onNoteEdit({ id: note.id, color });
    };

    const handleNoteKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        // Only handle keys originating on the note container itself, not
        // bubbled from the textarea.
        if (e.target !== e.currentTarget) return;

        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight": {
                e.preventDefault();
                const step = e.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
                let newX = note.x;
                let newY = note.y;
                if (e.key === "ArrowUp") newY -= step;
                else if (e.key === "ArrowDown") newY += step;
                else if (e.key === "ArrowLeft") newX -= step;
                else newX += step;
                newX = Math.max(0, Math.min(newX, window.innerWidth - note.width));
                newY = Math.max(0, Math.min(newY, window.innerHeight - note.height));
                if (newX !== note.x || newY !== note.y) {
                    onBringToFront({ id: note.id });
                    onNoteEdit({ id: note.id, x: newX, y: newY });
                }
                return;
            }
            case "Enter":
            case "F2": {
                e.preventDefault();
                setIsTextEditing(true);
                return;
            }
            case "Delete":
            case "Backspace": {
                e.preventDefault();
                onNoteDelete({ id: note.id });
                return;
            }
        }
    };

    const showPicker = isHovered && !isInteracting && !isOverTrash;
    const ariaLabel = `Note: ${note.text || "empty"}`;

    return (
        <div
            ref={noteRef}
            className="note-focusable"
            tabIndex={0}
            role="article"
            aria-label={ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onDoubleClick={() => setIsTextEditing(true)}
            onKeyDown={handleNoteKeyDown}
            style={containerStyle}
        >
            {showPicker && <ColorPicker value={note.color} onChange={handleColorChange} />}
            <div style={paperStyle}>
                <div style={cornerFoldStyle} />
                {!isTextEditing && <p style={textStyle}>{note.text}</p>}
                {isTextEditing && (
                    <textarea
                        style={textAreaBaseStyle}
                        value={note.text}
                        onChange={handleTextEdit}
                        onKeyDown={handleTextAreaKeyDown}
                        onBlur={() => setIsTextEditing(false)}
                        autoFocus
                        aria-label="Note text"
                    />
                )}
                <div
                    style={resizeHandleStyle}
                    onPointerDown={handleResizePointerDown}
                />
            </div>
        </div>
    );
};

export const Note = memo(NoteComponent);
