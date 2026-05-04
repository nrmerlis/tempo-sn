import { describe, expect, test } from "vitest";
import { clampNoteSpawnPosition } from "../../src/components/boardHelpers";

const VIEWPORT = { width: 1024, height: 768 };
const NOTE_SIZE = 200;
const TRASH = { left: 900, top: 700, right: 980, bottom: 750 };
const MARGIN = 20;

describe("clampNoteSpawnPosition", () => {
    test("keeps position when fully inside the viewport and away from trash", () => {
        const result = clampNoteSpawnPosition({
            rawX: 100,
            rawY: 100,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: TRASH,
            trashMargin: MARGIN,
        });
        expect(result).toEqual({ x: 100, y: 100 });
    });

    test("clamps to viewport right edge", () => {
        const result = clampNoteSpawnPosition({
            rawX: 1500,
            rawY: 100,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: null,
            trashMargin: MARGIN,
        });
        expect(result.x).toBe(VIEWPORT.width - NOTE_SIZE);
    });

    test("clamps negative coordinates to zero", () => {
        const result = clampNoteSpawnPosition({
            rawX: -50,
            rawY: -100,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: null,
            trashMargin: MARGIN,
        });
        expect(result).toEqual({ x: 0, y: 0 });
    });

    test("returns clamped position without avoidance when trashRect is null", () => {
        const result = clampNoteSpawnPosition({
            rawX: 900,
            rawY: 700,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: null,
            trashMargin: MARGIN,
        });
        expect(result).toEqual({ x: 824, y: 568 });
    });

    test("pushes note up when overlapping trash and pushUp <= pushLeft", () => {
        const result = clampNoteSpawnPosition({
            rawX: 800,
            rawY: 600,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: TRASH,
            trashMargin: MARGIN,
        });
        // clamped = (800, 568); overlaps trash forbidden zone;
        // pushUp = 88, pushLeft = 120 -> push up: y = forbiddenTop - noteSize = 480
        expect(result).toEqual({ x: 800, y: 480 });
    });

    test("pushes note left when pushLeft < pushUp", () => {
        const tallTrash = { left: 950, top: 200, right: 1000, bottom: 250 };
        const result = clampNoteSpawnPosition({
            rawX: 824,
            rawY: 100,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: tallTrash,
            trashMargin: MARGIN,
        });
        // clamped = (824, 100); overlaps; pushUp = 120, pushLeft = 94
        // -> push left: x = forbiddenLeft - noteSize = 730
        expect(result).toEqual({ x: 730, y: 100 });
    });

    test("clamps push-up result to zero when there is not enough room above", () => {
        const trashNearTop = { left: 0, top: 100, right: 100, bottom: 150 };
        const result = clampNoteSpawnPosition({
            rawX: 0,
            rawY: 50,
            noteSize: NOTE_SIZE,
            viewport: VIEWPORT,
            trashRect: trashNearTop,
            trashMargin: MARGIN,
        });
        // pushUp wins; forbiddenTop - noteSize = 80 - 200 = -120 -> clamped to 0
        expect(result).toEqual({ x: 0, y: 0 });
    });
});
