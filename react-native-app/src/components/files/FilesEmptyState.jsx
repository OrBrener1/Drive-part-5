import { useContext } from "react";
import { View, Text } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";

export default function FilesEmptyState({
  title = "No files yet",
  subtitle = "Create a file or folder to get started",
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 16,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
