import { useLocalSearchParams } from "expo-router";
import FilesScreen from "../../../../src/screens/Files/FilesScreen";

export default function FolderRoute() {
  const { id } = useLocalSearchParams();
  return <FilesScreen parentId={id} />;
}
