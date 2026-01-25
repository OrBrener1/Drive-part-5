import { useContext } from "react";
import { View, Text } from "react-native";
import { ThemeContext } from "../../theme/themeContext";

export default function FilesHeader() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <View style={{ paddingVertical: 12 }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: "600",
        }}
      >
        My Drive
      </Text>
    </View>
  );
}
