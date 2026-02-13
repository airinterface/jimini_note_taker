import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useServices } from '@/contexts/ServiceProvider';
import usePatients from '@/hooks/usePatients';
import Loading from '@/components/Loading';
import PatientListComponent from '@/components/PatientList';

type RootStackParamList = {
  Chat: { name: string };
};

function PatientList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientsRepository } = useServices();
  const { isLoading, patients } = usePatients(patientsRepository);
  if (isLoading) {
    return <Loading />
  }
  return (
    <PatientListComponent patients={patients}
      onPress={(patient) => navigation.navigate('NoteList', { patient })}
    />

  );
}

export default PatientList;