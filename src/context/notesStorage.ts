import type { Note } from "../types/notes.types";

const STORAGE_KEY = "sticky-notes:v1";
const SCHEMA_VERSION = 1;

export interface PersistedNotesState {
    notes: Note[];
    nextId: number;
    nextZIndex: number;
}

interface PersistedPayload extends PersistedNotesState {
    schemaVersion: number;
}

export const loadFromStorage = (): PersistedNotesState | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
        if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
        if (!Array.isArray(parsed.notes)) return null;
        if (typeof parsed.nextId !== "number" || typeof parsed.nextZIndex !== "number") return null;
        return {
            notes: parsed.notes as Note[],
            nextId: parsed.nextId,
            nextZIndex: parsed.nextZIndex,
        };
    } catch {
        return null;
    }
};

export const saveToStorage = (state: PersistedNotesState): void => {
    try {
        const payload: PersistedPayload = {
            schemaVersion: SCHEMA_VERSION,
            notes: state.notes,
            nextId: state.nextId,
            nextZIndex: state.nextZIndex,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn("Failed to persist notes:", e);
    }
};
