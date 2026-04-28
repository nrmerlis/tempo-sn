import { type CSSProperties } from "react";
import { FloatingCard } from "./FloatingCard";
import { Tooltip } from "./Tooltip";
import infoIcon from "../assets/info.svg";

const iconStyle: CSSProperties = {
    width: 30,
    height: 30,
    cursor: "help",
};

const titleStyle: CSSProperties = {
    margin: "0 0 8px 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#222",
};

const listStyle: CSSProperties = {
    margin: 0,
    paddingLeft: 18,
};

const ACTIONS = [
    "Double-click on the board to add a new random color note",
    "Double-click on a note to edit its text",
    "Drag a note to move it around",
    "Drag the corner handle to resize a note",
    "Drag a note onto the trash to delete it",
];

const helpContent = (
    <>
        <p style={titleStyle}>What you can do</p>
        <ul style={listStyle}>
            {ACTIONS.map(action => <li key={action}>{action}</li>)}
        </ul>
    </>
);

export const InfoTooltip = () => (
    <Tooltip content={helpContent} placement="bottom">
        <FloatingCard>
            <img src={infoIcon} alt="Help" style={iconStyle} />
        </FloatingCard>
    </Tooltip>
);
