import BackgroundFetch from 'react-native-background-fetch'

import { database } from '@/data/database'
import Patient from '@/data/model/Patient'
import Note from '@/data/model/Note'

class SyncService {
  private isSyncing = false

  async fetchAndSyncData() {
    if (this.isSyncing) {
      console.log('Sync already in progress')
      return
    }

    this.isSyncing = true
    console.log('Starting background sync...')

    try {
      // Fetch data from your API
      const [patientsData, notesData] = await Promise.all([
        this.fetchPatientsFromAPI(),
        this.fetchNotesFromAPI(),
      ])

      // Sync to local database
      await this.syncPatients(patientsData)
      await this.syncNotes(notesData)

      console.log('Background sync completed successfully')
    } catch (error) {
      console.error('Background sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }


  private async fetchPatientsFromAPI() {
    // Replace with your actual API endpoint
    const response = await fetch('https://your-api.com/api/patients')
    return response.json()
  }

  private async fetchNotesFromAPI() {
    // Replace with your actual API endpoint
    const response = await fetch('https://your-api.com/api/notes')
    return response.json()
  }


  private async syncNotes(notesData: any[]) {
    await database.write(async () => {
      const notesCollection = database.collections.get<Note>('notes')

      for (const noteData of notesData) {
        // Check if note exists
        const existingNotes = await notesCollection
          .query(Q.where('note_id', noteData.note_id))
          .fetch()

        if (existingNotes.length > 0) {
          // Update existing note
          const note = existingNotes[0]
          await note.update(n => {
            n.encryptedData = noteData.encrypted_data
            n.sessionType = noteData.session_type
            n.syncStatus = noteData.sync_status
            n.isDeleted = noteData.is_deleted
            n.isSynced = true
          })
        } else {
          // Create new note
          await notesCollection.create(note => {
            note.noteId = noteData.note_id
            note.patientId = noteData.patient_id
            note.sessionType = noteData.session_type
            note.conversationId = noteData.conversation_id
            note.encryptedData = noteData.encrypted_data
            note.syncStatus = noteData.sync_status || 'synced'
            note.isDeleted = noteData.is_deleted || false
            note.isSynced = true
          })
        }
      }
    })
  }

  // Method to upload pending local changes to server
  async uploadPendingChanges() {
    const notesCollection = database.collections.get<Note>('notes')
    const pendingNotes = await notesCollection
      .query(Q.where('sync_status', 'pending'))
      .fetch()

    for (const note of pendingNotes) {
      try {
        await this.uploadNoteToAPI(note)

        await database.write(async () => {
          await note.update(n => {
            n.syncStatus = 'synced'
            n.isSynced = true
          })
        })
      } catch (error) {
        console.error(`Failed to upload note ${note.noteId}:`, error)

        await database.write(async () => {
          await note.update(n => {
            n.syncStatus = 'failed'
          })
        })
      }
    }
  }

  private async uploadNoteToAPI(note: Note) {
    const response = await fetch('https://your-api.com/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note_id: note.noteId,
        patient_id: note.patientId,
        session_type: note.sessionType,
        conversation_id: note.conversationId,
        encrypted_data: note.encryptedData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to upload note')
    }

    return response.json()
  }
}

export const syncService = new SyncService()


BackgroundFetch.configure({
  minimumFetchInterval: 15,
  stopOnTerminate: false,
  enableHeadless: true,
  startOnBoot: true,
}, async (taskId) => {
  console.log('[BackgroundFetch] Running in background thread')
  await syncService.fetchAndSyncData()
  BackgroundFetch.finish(taskId)
}, (taskId) => {
  BackgroundFetch.finish(taskId)
})
