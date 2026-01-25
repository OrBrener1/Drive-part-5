import { useContext, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import Avatar from "../avatar/Avatar";
import BottomSheet from "../bottomSheet/BottomSheet";
import { createStyles } from "./UserMenu.styles";

export default function UserMenu({ visible, onClose }) {
  // Access global theme (colors, spacing, typography, radius)
  const { theme, mode, toggleTheme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  // Auth data and actions
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const themeToggleEmoji = useMemo(
    () => (mode === "dark" ? "🌞" : "🌙"),
    [mode]
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightPercent={0.92}
      titleLeft={themeToggleEmoji}
      onLeftPress={toggleTheme}
      titleRight="Finished"      // Explicit close action
    >
      <View style={styles.container}>
        {/* Email (centered, above avatar) */}
        <Text style={styles.email}>
          {user?.email}
        </Text>

        {/* User avatar (image or initials handled internally) */}
        <Avatar user={user} size="xl" />

        {/* Greeting */}
        <Text style={styles.greeting}>
          Hi, {user?.displayName || "User"}
        </Text>

        {/* Placeholder for future content (logo / actions) */}
        <View style={styles.placeholder}>
          {/* Future content goes here */}
        </View>

        {/* Logout action */}
        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            logout();              // Clear auth state
            onClose();             // Close the bottom sheet
            //router.replace("public/login"); // Redirect to login screen
          }}
        >
          <Text style={styles.logoutText}>🚪 Log out</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
