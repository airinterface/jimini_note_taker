import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Patient } from '@/types';

type PatientListItemProps = {
  patient: Patient;
  onPress?: (patient: Patient) => void;
};

function PatientListItem({ patient, onPress }: PatientListItemProps) {
  return (
    <Pressable style={styles.container} onPress={() => onPress?.(patient)}>
      <Text style={styles.nameText}>{patient.firstName} {patient.lastName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nameText: {
    fontSize: 16,
  },
});

export default PatientListItem;
