import { FlatList } from "react-native";
import FileRow from "./FileRow";

export default function FileList({
  files,
  onItemPress,
  onOpenPermissions,
  onToggleStar,
  onMoveToBin,
  onRestoreFromBin,
  listContext,
  currentUserId,
}) {
  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FileRow
          item={item}
          onPress={() => onItemPress?.(item)}
          onOpenPermissions={onOpenPermissions}
          onToggleStar={onToggleStar}
          onMoveToBin={onMoveToBin}
          onRestoreFromBin={onRestoreFromBin}
          listContext={listContext}
          currentUserId={currentUserId}
        />
      )}
    />
  );
}
