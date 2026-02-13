import { database } from "@/data/database";
import Patient from "@/data/model/Patient";
import { Patient as PatientType, PatientRepository, ApiService } from "@/types"
import { logger } from "@/utils/logger";
import { Q } from "@nozbe/watermelondb";

interface PatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export class PatientsRepository implements PatientRepository {
  isSyncing: boolean = false;

  constructor(private apiService: ApiService) { }

  async getPatientsForProvider(providerId: string): Promise<PatientType[]> {
    return this.getPatients();
  }

  async getPatients(): Promise<PatientType[]> {
    try {
      const patients = await this.apiService.get<PatientResponse[]>('/patients');
      logger.info("patients :: " + patients)
      return patients.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName
      }));
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      return [];
    }
  }

  private async syncPatients(patientsData: any[]) {
    await database.write(async () => {
      const patientsCollection = database.collections.get<Patient>('patients')

      for (const patientData of patientsData) {
        // Check if patient exists
        const existingPatients = await patientsCollection
          .query(Q.where('patient_id', patientData.patient_id))
          .fetch()

        if (existingPatients.length > 0) {
          // Update existing patient
          const patient = existingPatients[0]
          await patient.update(p => {
            p.patientInitial = patientData.patient_initial
            p.firstName = patientData.first_name
            p.lastName = patientData.last_name
          })
        } else {
          // Create new patient
          await patientsCollection.create(patient => {
            patient.patientId = patientData.patient_id
            patient.patientInitial = patientData.patient_initial
            patient.firstName = patientData.first_name
            patient.lastName = patientData.last_name
          })
        }
      }
    })
  }

}

