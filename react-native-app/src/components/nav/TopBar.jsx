import { useContext, useState } from "react";
import { I18nManager, Pressable, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import UserMenu from "../userMenu/UserMenu";
import NavMenu from "./NavMenu";
import Avatar from "../avatar/Avatar";

export default function TopBar({
  query,
  onChangeQuery,
  placeholder = "Search in Drive",
  showNavMenu = true,
  onBack,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user } = useContext(AuthContext);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
         {/* User Avatar */}
        <Pressable
          onPress={() => setUserMenuOpen(true)}
          hitSlop={8}
          style={{ zIndex: 2 }}
        >
          <Avatar user={user} size="sm" />
        </Pressable>
        
        {/* Search */}
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

        {onBack ? (
          <Pressable
            onPress={onBack}
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
          <MaterialIcons
            name={I18nManager.isRTL ? "arrow-back" : "arrow-forward"}
            size={20}
            color={colors.textSecondary}
          />
          </Pressable>
        ) : showNavMenu ? (
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
        ) : null}
      </View>

      <UserMenu visible={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
      {showNavMenu ? (
        <NavMenu visible={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
      ) : null}
    </>
  );
}
