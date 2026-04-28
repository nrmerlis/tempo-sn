import { useState, type CSSProperties, type ReactNode } from "react";

interface TooltipProps {
    content: ReactNode;
    placement?: "top" | "bottom";
    children: ReactNode;
}

const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "fit-content",
};

const baseTooltipStyle: CSSProperties = {
    position: "absolute",
    right: 0,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 0 10px 0 #B1BFCF",
    borderRadius: 10,
    padding: "14px 18px",
    minWidth: 160,
    fontSize: 14,
    color: "#333",
    lineHeight: 1.6,
    textAlign: "left",
    zIndex: 10000,
    pointerEvents: "none",
};

const placementStyles: Record<"top" | "bottom", CSSProperties> = {
    top: { bottom: "100%", marginBottom: 8 },
    bottom: { top: "100%", marginTop: 8 },
};

export const Tooltip = ({ content, placement = "bottom", children }: TooltipProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div
            style={wrapperStyle}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {children}
            {open && (
                <div style={{ ...baseTooltipStyle, ...placementStyles[placement] }} role="tooltip">
                    {content}
                </div>
            )}
        </div>
    );
};
