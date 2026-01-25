import { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/ThemeContext";
import SideDrawer from "./SideDrawer";

export default function NavMenu({ visible, onClose }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const router = useRouter();
  const logoSource = require("../../../assets/ogs-logo.png");
  const logoMeta = Image.resolveAssetSource(logoSource);
  const logoAspect = logoMeta?.width ? logoMeta.width / logoMeta.height : 1;
  const logoWidth = 180;
  const logoHeight = logoAspect ? logoWidth / logoAspect : 60;

  const items = [
    { label: "Recent", emoji: "🕘", path: "/private/recent" },
    { label: "Bin", emoji: "🗑️", path: "/private/bin" },
  ];

  return (
    <SideDrawer
      visible={visible}
      side="right"
      onClose={onClose}
      contentStyle={{ backgroundColor: colors.surface }}
    >
      <View style={{ alignItems: "flex-start", marginTop: 8, marginBottom: 0 }}>
        <Image
          source={logoSource}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessibilityLabel="Drive logo"
        />
      </View>

      <View style={{ marginTop: 0, gap: 8 }}>
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
            <Text style={{ fontSize: 18 }}>
              {item.emoji}
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SideDrawer>
  );
}
