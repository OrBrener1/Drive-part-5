import { useContext, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import Avatar from "../avatar/Avatar";
import BottomSheet from "../bottomSheet/BottomSheet";
import { createStyles } from "./UserMenu.styles";
import { MaterialIcons } from "@expo/vector-icons";

export default function UserMenu({ visible, onClose }) {
  // Access global theme (colors, spacing, typography, radius)
  const { theme, mode, toggleTheme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const { colors } = theme;

  // Auth data and actions
  const { user, logout, updateUserAvatar } = useContext(AuthContext);
  const router = useRouter();
  const themeToggleEmoji = useMemo(
    () => (mode === "dark" ? "☀️" : "🌙"),
    [mode]
  );

  const [showAvatarActions, setShowAvatarActions] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const applyAvatarUpdate = async (image) => {
    setAvatarError("");
    setUpdatingAvatar(true);

    const result = await updateUserAvatar(image);

    if (!result.ok) {
      setAvatarError(result.message || "Avatar update failed");
    }

    setUpdatingAvatar(false);
  };

  // ---- Image handlers ----
  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await applyAvatarUpdate(asset.base64);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setAvatarError("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await applyAvatarUpdate(asset.base64);
    }
  };

  const removeImage = async () => {
    await applyAvatarUpdate(null);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightPercent={0.92}
      titleLeft={themeToggleEmoji}
      onLeftPress={toggleTheme}
      titleRight="Finished" // Explicit close action
    >
      <View style={styles.container}>
        {/* Email (centered, above avatar) */}
        <Text style={styles.email}>{user?.email}</Text>

        {/* User avatar (image or initials handled internally) */}
        <Pressable
          style={styles.avatarPressable}
          onPress={() => setShowAvatarActions((prev) => !prev)}
          disabled={updatingAvatar}
        >
          <View>
            <Avatar user={user} size="xl" />
            <View style={styles.avatarBadge}>
              <MaterialIcons name="photo-camera" size={16} color={colors.textPrimary} />
            </View>
          </View>
        </Pressable>

        {showAvatarActions && (
          <>
            <View style={styles.imageActionsRow}>
              <Pressable
                style={styles.imageActionBtn}
                onPress={pickImageFromLibrary}
                disabled={updatingAvatar}
              >
                <MaterialIcons name="cloud-upload" size={16} color={colors.primary} />
                <Text style={styles.imageActionText}>Upload from device</Text>
              </Pressable>
            </View>

            {!!user?.image && (
              <Pressable style={styles.removeImageRow} onPress={removeImage}>
                <Text style={styles.removeImageText}>Remove image</Text>
              </Pressable>
            )}

            {!!avatarError && <Text style={styles.errorText}>{avatarError}</Text>}
          </>
        )}

        {/* Greeting */}
        <Text style={styles.greeting}>Hi, {user?.displayName || "User"}</Text>

        {/* Placeholder for future content (logo / actions) */}
        <View style={styles.placeholder}>
          <Image
            source={require("../../../assets/ogs-logo.png")}
            style={styles.gif}
            resizeMode="contain"
            accessibilityLabel="OGS logo"
          />
        </View>

        {/* Logout action */}
        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            logout(); // Clear auth state
            onClose(); // Close the bottom sheet
            //router.replace("public/login"); // Redirect to login screen
          }}
        >
          <Text style={styles.logoutText}>🚪 Log out</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
