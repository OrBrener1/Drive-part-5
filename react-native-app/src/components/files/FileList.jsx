import { FlatList } from "react-native";
import FileRow from "./FileRow";

export default function FileList({
  files,
  onItemPress,
  onOpenPermissions,
  onToggleStar,
  onMoveToBin,
  onRestoreFromBin,
  onDeleteForever,
  onRenameSuccess,
  onUnauthorized,
  listContext,
  currentUserId,
  contentContainerStyle,
  style,
}) {
  return (
    <FlatList
      style={style}
      data={files}
      keyExtractor={(item) => item.id}
      contentContainerStyle={contentContainerStyle}
      renderItem={({ item }) => (
        <FileRow
          item={item}
          onPress={() => onItemPress?.(item)}
          onOpenPermissions={onOpenPermissions}
          onToggleStar={onToggleStar}
          onMoveToBin={onMoveToBin}
          onRestoreFromBin={onRestoreFromBin}
          onDeleteForever={onDeleteForever}
          onRenameSuccess={onRenameSuccess}
          onUnauthorized={onUnauthorized}
          listContext={listContext}
          currentUserId={currentUserId}
        />
      )}
    />
  );
}
