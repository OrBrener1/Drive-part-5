import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../theme/themeContext";
import SideDrawer from "./SideDrawer";

export default function NavMenu({ visible, onClose }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const router = useRouter();

  const items = [
    { label: "Recent", icon: "schedule", path: "/(tabs)/home" },
    { label: "Bin", icon: "delete", path: "/bin" },
  ];

  return (
    <SideDrawer
      visible={visible}
      side="right"
      onClose={onClose}
      contentStyle={{ backgroundColor: colors.surface }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
        Drive
      </Text>

      <View style={{ marginTop: 16, gap: 8 }}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              onClose?.();
              router.push(item.path);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 10,
              paddingHorizontal: 8,
              borderRadius: 10,
            }}
          >
            <MaterialIcons name={item.icon} size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SideDrawer>
  );
}
