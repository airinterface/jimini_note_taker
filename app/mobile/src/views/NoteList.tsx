import { Patient } from "@/types";
import { Text } from "react-native";

type NoteListProps = {
  route: {
    params: {
      patient: Patient
    }
  };
};
function NoteList({ route }: NoteListProps) {
  const { patient } = route.params;
  return <Text>This is {patient.firstName} {patient.lastName}'s chat</Text>;
}

export default NoteList;