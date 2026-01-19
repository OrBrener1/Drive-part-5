import { useContext, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import UserMenu from "./UserMenu";
import NavMenu from "./NavMenu";

function getInitials(name, email) {
  const base = (name || "").trim() || (email || "").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export default function TopBar({
  query,
  onChangeQuery,
  placeholder = "Search in Drive",
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const initials = getInitials(user?.displayName, user?.email);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <Pressable
          onPress={() => setUserMenuOpen(true)}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>{initials}</Text>
          )}
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 18,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 10,
          }}
        >
          <MaterialIcons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              color: colors.textPrimary,
            }}
          />
        </View>

        <Pressable
          onPress={() => setNavMenuOpen(true)}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            zIndex: 2,
          }}
        >
          <MaterialIcons name="menu" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <UserMenu visible={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
      <NavMenu visible={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
    </>
  );
}
