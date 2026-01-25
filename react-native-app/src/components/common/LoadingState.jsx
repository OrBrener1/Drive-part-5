import { useContext } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ThemeContext } from "../../Theme/themeContext";

export default function LoadingState({ label }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <ActivityIndicator color={colors.primary} />
      {label ? (
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
