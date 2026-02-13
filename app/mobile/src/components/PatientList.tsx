import React from 'react';
import { ScrollView } from 'react-native';
import { Patient } from '@/types';
import PatientListItem from './PatientListItem';

type PatientListProps = {
  patients: Patient[];
  onPress?: (patient: Patient) => void;
};

function PatientList({ patients, onPress }: PatientListProps) {
  return (
    <ScrollView>
      {patients.map((patient) => (
        <PatientListItem key={patient.id} patient={patient} onPress={onPress} />
      ))}
    </ScrollView>
  );
}

export default PatientList;
