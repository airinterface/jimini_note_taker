import { Model } from '@nozbe/watermelondb'
import { field, relation, date, readonly } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'
import Patient from './Patient'

export default class Note extends Model {
  static table = 'notes'

  static associations: Associations = {
    patients: { type: 'belongs_to' as const, key: 'patient_id' },
  }

  @field('note_id') noteId!: string
  @field('patient_id') patientId!: string
  @field('session_type') sessionType!: string
  @field('conversation_id') conversationId!: string
  @field('encrypted_data') encryptedData!: string
  @field('sync_status') syncStatus!: 'synced' | 'pending' | 'failed'
  @field('is_deleted') isDeleted!: boolean
  @field('is_synced') isSynced!: boolean
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @relation('patients', 'patient_id') patient!: Patient
}
