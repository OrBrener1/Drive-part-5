// Reusable UI component: File List.

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
  viewMode = "list",
  scrollEnabled = true,
}) {
  const isGrid = viewMode === "grid";
  return (
    <FlatList
      key={isGrid ? "grid" : "list"}
      style={style}
      data={files}
      keyExtractor={(item) => item.id}
      numColumns={isGrid ? 2 : 1}
      columnWrapperStyle={isGrid ? { justifyContent: "space-between" } : undefined}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      scrollEnabled={scrollEnabled}
      contentContainerStyle={[
        contentContainerStyle,
        isGrid ? { paddingHorizontal: 12 } : null,
      ]}
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
          viewMode={viewMode}
        />
      )}
    />
  );
}
