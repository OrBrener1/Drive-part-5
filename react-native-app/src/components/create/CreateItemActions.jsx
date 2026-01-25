import { View, Pressable, Text } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../../theme/themeContext";

export default function CreateItemActions({
  type,
  onSubmit,
  onCancel,
  canSubmit,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

   return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
      }}
    >
      <Pressable onPress={onCancel} style={{ marginRight: 12 }}>
        <Text style={{ color: colors.textSecondary }}>Cancel</Text>
      </Pressable>

      <Pressable
        onPress={canSubmit ? onSubmit : undefined}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: canSubmit
            ? colors.primary
            : colors.primaryDisabled,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "500" }}>
          Create
        </Text>
      </Pressable>
    </View>
  );
}
