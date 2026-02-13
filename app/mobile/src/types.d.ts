export interface ApiService {
  post<T>(endpoint: string, data: any): Promise<T>;
  get<T>(endpoint: string): Promise<T>;
  patch<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

export interface NoteItem {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
}

export interface Note {
  id: string;
  patient_id: string;
  sessionDate: string;
  sessionType: 'initial' | 'follow_up' | 'crisis' | 'assessment';
  notes: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  is_deleted: boolean;
}

export interface NoteRepository {
  createNote(patientId: string, message: string): Promise<void>;
  getNotes(patientId: string): Promise<Note[]>;
  updateNotes(noteId: string, message: string): Promise<void>;
  deleteNote(noteId: string): Promise<void>;
}

export interface PatientRepository {
  getPatients(): Promise<Patient[]>;
}


export interface Patient {
  id: string
  firstName: string
  lastName: string
}