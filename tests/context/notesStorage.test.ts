import { beforeEach, describe, expect, test } from "vitest";
import { loadFromStorage, saveToStorage } from "../../src/context/notesStorage";
import type { Note } from "../../src/types/notes.types";

const STORAGE_KEY = "sticky-notes:v1";

const sampleNote: Note = {
    id: 0,
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    text: "hi",
    color: "#FFDD33",
    zIndex: 1,
};

const sampleState = { notes: [sampleNote], nextId: 1, nextZIndex: 2 };

describe("notesStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("round-trip preserves state", () => {
        saveToStorage(sampleState);
        expect(loadFromStorage()).toEqual(sampleState);
    });

    test("returns null when storage is empty", () => {
        expect(loadFromStorage()).toBeNull();
    });

    test("returns null on corrupt JSON", () => {
        localStorage.setItem(STORAGE_KEY, "{not valid");
        expect(loadFromStorage()).toBeNull();
    });

    test("returns null on schema version mismatch", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            schemaVersion: 99,
            notes: [],
            nextId: 0,
            nextZIndex: 1,
        }));
        expect(loadFromStorage()).toBeNull();
    });

    test("returns null when notes is missing", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            schemaVersion: 1,
            nextId: 0,
            nextZIndex: 1,
        }));
        expect(loadFromStorage()).toBeNull();
    });

    test("returns null when counters are missing", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            schemaVersion: 1,
            notes: [],
        }));
        expect(loadFromStorage()).toBeNull();
    });

    test("persists an empty notes array (intentional clear)", () => {
        saveToStorage({ notes: [], nextId: 5, nextZIndex: 10 });
        expect(loadFromStorage()).toEqual({ notes: [], nextId: 5, nextZIndex: 10 });
    });
});
