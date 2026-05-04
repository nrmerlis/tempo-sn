import { useCallback, useMemo, useReducer, type ReactNode } from "react";
import {
    NOTE_COLORS,
    type AddNotePayload,
    type BringToFrontPayload,
    type DeleteNotePayload,
    type EditNotePayload,
    type Note,
    type NotesAction,
} from "../types/notes.types";
import {
    NotesActionsContext,
    NotesStateContext,
    type NotesActionsValue,
    type NotesStateValue,
} from "./useNotes";

interface NotesState {
    notes: Note[];
    nextId: number;
    nextZIndex: number;
    lastAddedId: number | null;
}

const initialState: NotesState = {
    notes: [
        { id: 0, x: 300, y: 300, width: 200, height: 200, text: "Double click to edit me!", color: NOTE_COLORS[0], zIndex: 1 }
    ],
    nextId: 1,
    nextZIndex: 2,
    lastAddedId: null,
};

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
    switch (action.type) {
        case "ADD_NOTE": {
            const id = state.nextId;
            const zIndex = state.nextZIndex;
            return {
                notes: [...state.notes, { ...action.payload, id, zIndex }],
                nextId: id + 1,
                nextZIndex: zIndex + 1,
                lastAddedId: id,
            };
        }
        case "EDIT_NOTE": {
            return {
                ...state,
                notes: state.notes.map(n =>
                    n.id === action.payload.id ? { ...n, ...action.payload } : n
                ),
            };
        }
        case "DELETE_NOTE": {
            return {
                ...state,
                notes: state.notes.filter(n => n.id !== action.payload.id),
            };
        }
        case "BRING_TO_FRONT": {
            const target = state.notes.find(n => n.id === action.payload.id);
            if (!target || target.zIndex === state.nextZIndex - 1) return state;
            const zIndex = state.nextZIndex;
            return {
                ...state,
                notes: state.notes.map(n =>
                    n.id === action.payload.id ? { ...n, zIndex } : n
                ),
                nextZIndex: zIndex + 1,
            };
        }
        default:
            return state;
    }
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(notesReducer, initialState);

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
