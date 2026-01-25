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
  onMove,
  onRenameSuccess,
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
          onMove={onMove}
          onRenameSuccess={onRenameSuccess}
          listContext={listContext}
          currentUserId={currentUserId}
        />
      )}
    />
  );
}
