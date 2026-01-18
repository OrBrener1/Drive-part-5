import { FlatList } from "react-native";
import FileRow from "./FileRow";

export default function FileList({ files, onItemPress }) {
  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FileRow item={item} onPress={() => onItemPress?.(item)} />
      )}
    />
  );
}
