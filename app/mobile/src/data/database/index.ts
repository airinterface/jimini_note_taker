import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './schema/schema'
import migrations from './schema/migrations'

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: error => {
    // Handle error
  }
})

export const database = new Database({
  adapter,
  modelClasses: [
    // Your models here
  ],
})
