import { Model } from '@nozbe/watermelondb'
import { field, children, date, readonly } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'

export default class Patient extends Model {
  static table = 'patients'

  static associations: Associations = {
    notes: { type: 'has_many' as const, foreignKey: 'patient_id' },
  }

  @field('patient_id') patientId!: string
  @field('patient_initial') patientInitial!: string
  @field('first_name') firstName!: string
  @field('last_name') lastName!: string
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @children('notes') notes: any
}