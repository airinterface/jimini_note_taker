import { NoteRepository, ApiService, NoteItem, Note } from '@/types';

export class ProductionNoteRepository implements NoteRepository {
  constructor(private apiService: ApiService) { }

  async createNote(patientId: string, message: string): Promise<void> {
    await this.apiService.post('/api/v1/notes', {
      patient_id: patientId,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: 'initial',
      notes: message,
      syncStatus: 'pending'
    });
  }

  async getNotes(patientId: string): Promise<Note[]> {
    return this.apiService.get(`/api/v1/patients/${patientId}/notes`);
  }

  async updateNotes(noteId: string, message: string): Promise<void> {
    await this.apiService.patch(`/api/v1/notes/${noteId}`, {
      notes: message
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.apiService.delete(`/api/v1/notes/${noteId}`);
  }

  async sendMessage(message: string): Promise<void> {
    return this.apiService.post('/note/messages', { message });
  }

  async getMessages(patientId: string): Promise<NoteItem[]> {
    return this.apiService.get('/note/messages');
  }
}

export class MockNoteRepository implements NoteRepository {
  private messages: NoteItem[] = [
    { id: '1', text: 'Hello! How can I help you today?', timestamp: new Date(), sender: 'bot' }
  ];
  private notes: Note[] = [];

  async createNote(patientId: string, message: string): Promise<void> {
    console.log('Mock: Creating note for patient:', patientId);
    const newNote: Note = {
      id: Date.now().toString(),
      patient_id: patientId,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: 'initial',
      notes: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      is_deleted: false
    };
    this.notes.push(newNote);
  }

  async getNotes(patientId: string): Promise<Note[]> {
    console.log('Mock: Getting notes for patient:', patientId);
    return this.notes.filter(note => note.patient_id === patientId && !note.is_deleted);
  }

  async updateNotes(noteId: string, message: string): Promise<void> {
    console.log('Mock: Updating note:', noteId);
    const note = this.notes.find(n => n.id === noteId);
    if (note) {
      note.notes = message;
      note.updatedAt = new Date().toISOString();
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    console.log('Mock: Deleting note:', noteId);
    const note = this.notes.find(n => n.id === noteId);
    if (note) {
      note.is_deleted = true;
      note.updatedAt = new Date().toISOString();
    }
  }

  async sendMessage(message: string): Promise<void> {
    console.log('Mock: Sending message:', message);
    this.messages.push({
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      sender: 'user'
    });
    // Simulate bot response
    setTimeout(() => {
      this.messages.push({
        id: (Date.now() + 1).toString(),
        text: `Bot response to: ${message}`,
        timestamp: new Date(),
        sender: 'bot'
      });
    }, 1000);
  }

  async getMessages(): Promise<NoteItem[]> {
    return [...this.messages];
  }
}

