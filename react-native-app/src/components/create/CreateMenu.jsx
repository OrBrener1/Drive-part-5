import { useContext } from "react";
import { View, Pressable, Modal } from "react-native";
import { ThemeContext } from "../../Theme/themeContext";
import CreateMenuItem from "./CreateMenuItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateMenu({
  visible,
  onClose,
  onCreateFile,
  onCreateFolder,
  onUploadFile,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
        pointerEvents="box-none"
      >
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />

        {/* Menu */}
        <View
          style={{
            backgroundColor: colors.surface,
            width: "90%",
            borderRadius: 12,
            padding: 16,
            marginBottom: insets.bottom + 12, 
            elevation: 10,
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
      </View>
    </Modal>
  );
}
