import { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import SideDrawer from "./SideDrawer";

function getInitials(name, email) {
  const base = (name || "").trim() || (email || "").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export default function UserMenu({ visible, onClose }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const initials = getInitials(displayName, email);

  return (
    <SideDrawer
      visible={visible}
      side="left"
      onClose={onClose}
      contentStyle={{ backgroundColor: colors.surface }}
    >
      <View style={{ marginBottom: 20 }}>
        {user?.image ? (
          <Image
            source={{ uri: user.image }}
            style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 12 }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 18 }}>
              {initials}
            </Text>
          </View>
        )}
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
          {displayName}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{email}</Text>
      </View>

      <Pressable
        onPress={() => {
          logout();
          onClose?.();
          router.replace("/login");
        }}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Log out</Text>
      </Pressable>
    </SideDrawer>
  );
}
