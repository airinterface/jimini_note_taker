import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'patient_initial', type: 'string' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'note_id', type: 'string', isIndexed: true },
        { name: 'patient_id', type: 'string', isIndexed: true }, // Foreign key
        { name: 'session_type', type: 'string' },
        { name: 'conversation_id', type: 'string', isIndexed: true },
        { name: 'encrypted_data', type: 'string' },
        { name: 'sync_status', type: 'string' }, // 'synced' | 'pending' | 'failed'
        { name: 'is_deleted', type: 'boolean' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})

