import { useContext } from "react";
import { View, Pressable } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";
import CreateMenuItem from "./CreateMenuItem";

export default function CreateMenu({
  visible,
  onClose,
  onCreateFile,
  onCreateFolder,
  onUploadFile,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  if (!visible) return null;

  return (
    <Pressable
      onPress={onClose}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          width: "90%",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <CreateMenuItem
          label="Create file"
          onPress={onCreateFile}
          color={colors.textPrimary}
        />
        <CreateMenuItem
          label="Create folder"
          onPress={onCreateFolder}
          color={colors.textPrimary}
        />
        <CreateMenuItem
          label="Upload file"
          onPress={onUploadFile}
          color={colors.textPrimary}
        />
      </View>
    </Pressable>
  );
}
