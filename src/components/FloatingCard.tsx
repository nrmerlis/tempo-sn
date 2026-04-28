import { type CSSProperties, type ReactNode, type RefObject } from "react";

interface FloatingCardProps {
    ref?: RefObject<HTMLDivElement | null>;
    children: ReactNode;
}

const cardStyle: CSSProperties = {
    width: "fit-content",
    height: "fit-content",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 0 10px 0 #B1BFCF",
    borderRadius: 5,
    padding: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

export const FloatingCard = ({ ref, children }: FloatingCardProps) => {
    return (
        <div ref={ref} style={cardStyle}>
            {children}
        </div>
    );
};
