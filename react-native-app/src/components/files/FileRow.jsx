import { useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";

export default function FileRow({ item, onPress }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 15,
        }}
      >
        {item.type === "folder" ? "📁 " : "📄 "}
        {item.name}
      </Text>
    </Pressable>
  );
}
