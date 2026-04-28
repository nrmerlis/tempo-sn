export type NoteColor = "#86B8FF" | "#FFAB56" | "#FFDD33";

export const NOTE_COLORS: NoteColor[] = ["#FFDD33", "#86B8FF", "#FFAB56"];

export interface NoteRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface Note {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;

    text: string;
    zIndex: number;

    color: NoteColor;
}

export type AddNotePayload = Omit<Note, "id" | "zIndex">;
export type DeleteNotePayload = { id: number };
export type EditNotePayload = Partial<Omit<Note, "id">> & { id: number };

export type NotesAction =
    | { type: "ADD_NOTE"; payload: AddNotePayload }
    | { type: "DELETE_NOTE"; payload: DeleteNotePayload }
    | { type: "EDIT_NOTE"; payload: EditNotePayload };


