import { type CSSProperties, type PointerEvent } from "react";
import { NOTE_COLORS, type NoteColor } from "../types/notes.types";

interface ColorPickerProps {
    value: NoteColor;
    onChange: (color: NoteColor) => void;
}

const PICKER_HEIGHT = 28;
const PICKER_GAP = 6;
const SWATCH_SIZE = 18;

// Transparent wrapper that extends down to the note so there's no dead zone
// where the cursor would leave both the pill and the note (which would
// trigger pointerleave and hide the picker).
const wrapperStyle: CSSProperties = {
    position: "absolute",
    top: -PICKER_HEIGHT - PICKER_GAP,
    left: 0,
    paddingBottom: PICKER_GAP,
    cursor: "default",
    zIndex: 1,
};

const pillStyle: CSSProperties = {
    height: PICKER_HEIGHT,
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "0 6px",
    backgroundColor: "#FFFFFF",
    borderRadius: PICKER_HEIGHT / 2,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
};

const swatchStyle = (color: NoteColor, isCurrent: boolean): CSSProperties => ({
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: "50%",
    backgroundColor: color,
    border: isCurrent ? "2px solid #444" : "1px solid rgba(0, 0, 0, 0.12)",
    boxSizing: "border-box",
    cursor: "pointer",
    flexShrink: 0,
});

const stopBubble = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => (
    <div style={wrapperStyle} onPointerDown={stopBubble} onDoubleClick={stopBubble}>
        <div style={pillStyle}>
            {NOTE_COLORS.map(color => (
                <div
                    key={color}
                    role="button"
                    aria-label={`Set color ${color}`}
                    style={swatchStyle(color, color === value)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(color);
                    }}
                />
            ))}
        </div>
    </div>
);
