import { useContext } from "react";
import { Pressable, Text } from "react-native";
import { ThemeContext } from "../../theme/themeContext";

export default function CreateFab({ onPress }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 28 }}>+</Text>
    </Pressable>
  );
}
