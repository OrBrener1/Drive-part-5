import { useContext } from "react";
import { View, Pressable, Modal } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";
import CreateMenuItem from "./CreateMenuItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

console.log("🔥 CREATE MENU VERSION AAA");
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
  const tabBarHeight = useBottomTabBarHeight();

  if (!visible) return null;

   return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      {/* Root container MUST NOT block touches */}
      <View
        style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
        pointerEvents="box-none"
      >
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
          pointerEvents="auto"
        />

        {/* Menu */}
        <View
          style={{
            backgroundColor: colors.surface,
            width: "90%",
            borderRadius: 12,
            padding: 16,
            marginBottom: tabBarHeight + 12,
            zIndex: 10,
            elevation: 10,
          }}
          pointerEvents="auto"
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