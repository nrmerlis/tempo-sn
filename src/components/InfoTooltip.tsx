import { type CSSProperties } from "react";
import { FloatingCard } from "./FloatingCard";
import { Tooltip } from "./Tooltip";
import infoIcon from "../assets/info.svg";

const iconStyle: CSSProperties = {
    width: 30,
    height: 30,
    cursor: "help",
};

const sectionTitleStyle: CSSProperties = {
    margin: "0 0 6px 0",
    fontSize: 13,
    fontWeight: 600,
    color: "#222",
    textTransform: "uppercase",
    letterSpacing: 0.5,
};

const listStyle: CSSProperties = {
    margin: 0,
    paddingLeft: 18,
};

const sectionSpacerStyle: CSSProperties = {
    height: 12,
};

const MOUSE_ACTIONS = [
    "Double-click the board to add a note",
    "Double-click a note to edit its text",
    "Drag a note to move it",
    "Drag the corner to resize",
    "Drag onto the trash to delete",
    "Hover a note to change its color",
];

const KEYBOARD_ACTIONS = [
    `Ctrl+N to add a new note`,
    "Tab to focus a note",
    "Arrow keys to move (Shift = bigger steps)",
    "Enter or F2 to edit text",
    "Escape to exit edit mode",
    "Delete to remove the focused note",
];

const helpContent = (
    <>
        <p style={sectionTitleStyle}>Mouse</p>
        <ul style={listStyle}>
            {MOUSE_ACTIONS.map(action => <li key={action}>{action}</li>)}
        </ul>
        <div style={sectionSpacerStyle} />
        <p style={sectionTitleStyle}>Keyboard</p>
        <ul style={listStyle}>
            {KEYBOARD_ACTIONS.map(action => <li key={action}>{action}</li>)}
        </ul>
    </>
);

export const InfoTooltip = () => (
    <Tooltip content={helpContent} placement="bottom">
        <FloatingCard>
            <img
                src={infoIcon}
                alt=""
                role="img"
                aria-label="Help"
                style={iconStyle}
            />
        </FloatingCard>
    </Tooltip>
);
