export interface ApiService {
  post<T>(endpoint: string, data: any): Promise<T>;
  get<T>(endpoint: string): Promise<T>;
}

export interface NoteItem {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
}

export interface NoteRepository {
  sendMessage(message: string): Promise<void>;
  getMessages(): Promise<Note[]>;
}

export interface PatientRepository {
  getPatients(): Promise<Patient[]>;
}


export interface Patient {
  id: string
  firstName: string
  lastName: string
}