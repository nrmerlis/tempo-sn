import { createContext, useContext } from "react";
import type {
    AddNotePayload,
    BringToFrontPayload,
    DeleteNotePayload,
    EditNotePayload,
    Note,
} from "../types/notes.types";

export interface NotesStateValue {
    notes: Note[];
    lastAddedId: number | null;
}

export interface NotesActionsValue {
    onNoteAdd: (payload: AddNotePayload) => void;
    onNoteEdit: (payload: EditNotePayload) => void;
    onNoteDelete: (payload: DeleteNotePayload) => void;
    onBringToFront: (payload: BringToFrontPayload) => void;
}

export const NotesStateContext = createContext<NotesStateValue | null>(null);
export const NotesActionsContext = createContext<NotesActionsValue | null>(null);

export const useNotesState = (): NotesStateValue => {
    const context = useContext(NotesStateContext);
    if (!context) throw new Error("useNotesState must be used within a NotesProvider");
    return context;
};

export const useNotesActions = (): NotesActionsValue => {
    const context = useContext(NotesActionsContext);
    if (!context) throw new Error("useNotesActions must be used within a NotesProvider");
    return context;
};
