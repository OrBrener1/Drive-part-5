import { useLocalSearchParams } from "expo-router";
import FileViewScreen from "../../../src/screens/Files/FileViewScreen";

export default function FileRoute() {
  const { id } = useLocalSearchParams();
  return <FileViewScreen fileId={id} />;
}
