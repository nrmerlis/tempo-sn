import type { CSSProperties } from "react";

const containerStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    padding: 20,
    textAlign: "center",
};

const titleStyle: CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    color: "#333",
    margin: "0 0 12px 0",
};

const messageStyle: CSSProperties = {
    fontSize: 16,
    color: "#666",
    margin: 0,
    maxWidth: 400,
    lineHeight: 1.5,
};

export const UnsupportedViewport = () => {
    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>Screen size not supported</h1>
            <p style={messageStyle}>
                This application requires a minimum screen resolution of <strong>1024×768</strong> pixels. 
                Please resize your browser window or use a device with a larger screen.
            </p>
        </div>
    );
};
