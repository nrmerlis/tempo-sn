import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import {
    type AddNotePayload,
    type BringToFrontPayload,
    type DeleteNotePayload,
    type EditNotePayload,
} from "../types/notes.types";
import { defaultState, notesReducer, type NotesState } from "./notesReducer";
import { loadFromStorage, saveToStorage } from "./notesStorage";
import {
    NotesActionsContext,
    NotesStateContext,
    type NotesActionsValue,
    type NotesStateValue,
} from "./useNotes";

const initState = (): NotesState => {
    const stored = loadFromStorage();
    if (!stored) return defaultState;
    return {
        notes: stored.notes,
        nextId: stored.nextId,
        nextZIndex: stored.nextZIndex,
        lastAddedId: null,
    };
};

const PERSIST_DEBOUNCE_MS = 300;

export const NotesProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(notesReducer, undefined, initState);

    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    useEffect(() => {
        const handle = setTimeout(() => {
            saveToStorage({
                notes: state.notes,
                nextId: state.nextId,
                nextZIndex: state.nextZIndex,
            });
        }, PERSIST_DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [state.notes, state.nextId, state.nextZIndex]);

    useEffect(() => {
        const flush = () => {
            const latest = stateRef.current;
            saveToStorage({
                notes: latest.notes,
                nextId: latest.nextId,
                nextZIndex: latest.nextZIndex,
            });
        };
        window.addEventListener("beforeunload", flush);
        return () => window.removeEventListener("beforeunload", flush);
    }, []);

    const onNoteAdd = useCallback((payload: AddNotePayload) => dispatch({ type: "ADD_NOTE", payload }), []);
    const onNoteEdit = useCallback((payload: EditNotePayload) => dispatch({ type: "EDIT_NOTE", payload }), []);
    const onNoteDelete = useCallback((payload: DeleteNotePayload) => dispatch({ type: "DELETE_NOTE", payload }), []);
    const onBringToFront = useCallback((payload: BringToFrontPayload) => dispatch({ type: "BRING_TO_FRONT", payload }), []);

    const actionsValue = useMemo<NotesActionsValue>(() => ({
        onNoteAdd, onNoteEdit, onNoteDelete, onBringToFront,
    }), [onNoteAdd, onNoteEdit, onNoteDelete, onBringToFront]);

    const stateValue = useMemo<NotesStateValue>(() => ({
        notes: state.notes,
        lastAddedId: state.lastAddedId,
    }), [state.notes, state.lastAddedId]);

    return (
        <NotesActionsContext value={actionsValue}>
            <NotesStateContext value={stateValue}>
                {children}
            </NotesStateContext>
        </NotesActionsContext>
    );
};
