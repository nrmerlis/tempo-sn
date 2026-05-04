import { describe, expect, test } from "vitest";
import { notesReducer, type NotesState } from "../../src/context/notesReducer";
import { NOTE_COLORS, type Note } from "../../src/types/notes.types";

const baseNote: Note = {
    id: 0,
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    text: "hello",
    color: NOTE_COLORS[0],
    zIndex: 1,
};

const baseState: NotesState = {
    notes: [baseNote],
    nextId: 1,
    nextZIndex: 2,
    lastAddedId: null,
};

describe("notesReducer", () => {
    describe("ADD_NOTE", () => {
        test("appends a new note with the next id and zIndex", () => {
            const next = notesReducer(baseState, {
                type: "ADD_NOTE",
                payload: { x: 50, y: 50, width: 200, height: 200, text: "", color: NOTE_COLORS[1] },
            });
            expect(next.notes).toHaveLength(2);
            expect(next.notes[1]).toMatchObject({ id: 1, zIndex: 2, color: NOTE_COLORS[1] });
            expect(next.nextId).toBe(2);
            expect(next.nextZIndex).toBe(3);
            expect(next.lastAddedId).toBe(1);
        });
    });

    describe("EDIT_NOTE", () => {
        test("updates only the matched note", () => {
            const next = notesReducer(baseState, {
                type: "EDIT_NOTE",
                payload: { id: 0, x: 999 },
            });
            expect(next.notes[0].x).toBe(999);
            expect(next.notes[0].y).toBe(100);
        });

        test("preserves references for unaffected notes (so React.memo can skip)", () => {
            const second: Note = { ...baseNote, id: 5, zIndex: 2 };
            const state: NotesState = {
                ...baseState,
                notes: [baseNote, second],
                nextId: 6,
                nextZIndex: 3,
            };
            const next = notesReducer(state, {
                type: "EDIT_NOTE",
                payload: { id: 0, x: 999 },
            });
            expect(next.notes[1]).toBe(second);
        });

        test("does not increment any counter", () => {
            const next = notesReducer(baseState, {
                type: "EDIT_NOTE",
                payload: { id: 0, x: 999 },
            });
            expect(next.nextId).toBe(baseState.nextId);
            expect(next.nextZIndex).toBe(baseState.nextZIndex);
        });
    });

    describe("DELETE_NOTE", () => {
        test("removes the matching note", () => {
            const next = notesReducer(baseState, {
                type: "DELETE_NOTE",
                payload: { id: 0 },
            });
            expect(next.notes).toHaveLength(0);
        });

        test("is a no-op for unknown ids", () => {
            const next = notesReducer(baseState, {
                type: "DELETE_NOTE",
                payload: { id: 999 },
            });
            expect(next.notes).toEqual(baseState.notes);
        });
    });

    describe("BRING_TO_FRONT", () => {
        test("bumps the target zIndex and the counter", () => {
            const second: Note = { ...baseNote, id: 5, zIndex: 2 };
            const state: NotesState = {
                ...baseState,
                notes: [baseNote, second],
                nextId: 6,
                nextZIndex: 3,
            };
            const next = notesReducer(state, {
                type: "BRING_TO_FRONT",
                payload: { id: 0 },
            });
            expect(next.notes.find(n => n.id === 0)?.zIndex).toBe(3);
            expect(next.nextZIndex).toBe(4);
        });

        test("returns the same state when target is already on top", () => {
            const next = notesReducer(baseState, {
                type: "BRING_TO_FRONT",
                payload: { id: 0 },
            });
            expect(next).toBe(baseState);
        });

        test("is a no-op for unknown ids", () => {
            const next = notesReducer(baseState, {
                type: "BRING_TO_FRONT",
                payload: { id: 999 },
            });
            expect(next).toBe(baseState);
        });
    });
});
