import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { NOTE_COLORS, type AddNotePayload, type DeleteNotePayload, type EditNotePayload, type Note, type NotesAction } from "../types/notes.types";


interface NotesState {
    notes: Note[];
    prevId: number;
    lastAddedId: number | null;
}

interface NotesContextValue {
    notes: Note[];
    lastAddedId: number | null;
    onNoteEdit: (payload: EditNotePayload) => void;
    onNoteAdd: (payload: AddNotePayload) => void;
    onNoteDelete: (payload: DeleteNotePayload) => void;
}

const initialState: NotesState = {
    notes: [
        { id: 0, x: 300, y: 300, width: 200, height: 200, text: "Double click to edit me!", color: NOTE_COLORS[0], zIndex: 0 }
    ],
    prevId: 1,
    lastAddedId: null,
};

const notesReducer = (state: NotesState, action: NotesAction) => {
    switch (action.type) {
        case "EDIT_NOTE": {
            return {
                ...state,
                notes: state.notes.map(note => (note.id === action.payload.id ? { ...note, ...action.payload, zIndex: state.prevId } : note)),
                prevId: state.prevId + 1
            }
        }
        case "ADD_NOTE": {
            const newNote = { ...action.payload, id: state.prevId, zIndex: state.prevId };
            return {
                ...state,
                notes: [...state.notes, newNote],
                prevId: state.prevId + 1,
                lastAddedId: state.prevId,
            };
        }
        case "DELETE_NOTE": {
            return {
                ...state,
                notes: state.notes.filter(note => note.id !== action.payload.id)
            }
        }
        default:
            return state;
    }
}

const NotesContext = createContext<NotesContextValue | null>(null);

export const NotesProvider = ({ children }: { children: ReactNode }) => {

    const [state, dispatch] = useReducer(notesReducer, initialState);

    const onNoteEdit = useCallback((payload: EditNotePayload) => dispatch({ type: "EDIT_NOTE", payload }), []);

    const onNoteAdd = useCallback((payload: AddNotePayload) => dispatch({ type: "ADD_NOTE", payload }), []);
    
    const onNoteDelete = useCallback((payload: DeleteNotePayload) => dispatch({ type: "DELETE_NOTE", payload }), []);

    const notesContextValue: NotesContextValue = useMemo(() => {
        return {
            notes: state.notes,
            lastAddedId: state.lastAddedId,
            onNoteEdit,
            onNoteAdd,
            onNoteDelete,
        }
    }, [state, onNoteEdit, onNoteAdd, onNoteDelete])

    return (
        <NotesContext value={notesContextValue} >
            {children}
        </NotesContext >
    )
}

export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error("useNotesContext must be used within a NotesProvider");
    }
    return context;
}