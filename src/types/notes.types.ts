export const NOTE_COLORS = [
    "#FFE066", // yellow
    "#FFC59E", // peach
    "#FF9F9F", // coral
    "#FFB3D9", // pink
    "#D4B8FF", // lavender
    "#A6D8FF", // sky
    "#A8E6CF", // mint
    "#E0E0E0", // gray
] as const;

export type NoteColor = typeof NOTE_COLORS[number];

export const NOTE_TEXT_COLOR = "#222";

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
export type BringToFrontPayload = { id: number };

export type NotesAction =
    | { type: "ADD_NOTE"; payload: AddNotePayload }
    | { type: "DELETE_NOTE"; payload: DeleteNotePayload }
    | { type: "EDIT_NOTE"; payload: EditNotePayload }
    | { type: "BRING_TO_FRONT"; payload: BringToFrontPayload };
