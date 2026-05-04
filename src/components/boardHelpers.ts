export interface Viewport {
    width: number;
    height: number;
}

export interface SpawnRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface ClampInput {
    rawX: number;
    rawY: number;
    noteSize: number;
    viewport: Viewport;
    trashRect: SpawnRect | null;
    trashMargin: number;
}

export interface Position {
    x: number;
    y: number;
}

// Clamps a spawn position into the viewport and pushes it out of the trash
// "forbidden zone" (trashRect padded by trashMargin), choosing the shorter
// escape direction.
export const clampNoteSpawnPosition = (input: ClampInput): Position => {
    const { rawX, rawY, noteSize, viewport, trashRect, trashMargin } = input;

    let x = Math.max(0, Math.min(rawX, viewport.width - noteSize));
    let y = Math.max(0, Math.min(rawY, viewport.height - noteSize));

    if (!trashRect) return { x, y };

    const forbiddenLeft = trashRect.left - trashMargin;
    const forbiddenTop = trashRect.top - trashMargin;
    const forbiddenRight = trashRect.right + trashMargin;
    const forbiddenBottom = trashRect.bottom + trashMargin;

    const noteRight = x + noteSize;
    const noteBottom = y + noteSize;
    const overlaps =
        x < forbiddenRight && noteRight > forbiddenLeft &&
        y < forbiddenBottom && noteBottom > forbiddenTop;

    if (!overlaps) return { x, y };

    const pushUp = noteBottom - forbiddenTop;
    const pushLeft = noteRight - forbiddenLeft;
    if (pushUp <= pushLeft) {
        y = Math.max(0, forbiddenTop - noteSize);
    } else {
        x = Math.max(0, forbiddenLeft - noteSize);
    }
    return { x, y };
};
