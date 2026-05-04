import { NOTE_COLORS, type Note, type NotesAction } from "../types/notes.types";

export interface NotesState {
    notes: Note[];
    nextId: number;
    nextZIndex: number;
    lastAddedId: number | null;
}

export const defaultState: NotesState = {
    notes: [
        { id: 0, x: 300, y: 300, width: 200, height: 200, text: "Double click to edit me!", color: NOTE_COLORS[0], zIndex: 1 }
    ],
    nextId: 1,
    nextZIndex: 2,
    lastAddedId: null,
};

export const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
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
