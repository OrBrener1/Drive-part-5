// Reusable UI component: Create Item Input.

import { TextInput, Text, View } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../../theme/themeContext";

export default function CreateItemInput({
  value,
  onChange,
  placeholder,
  error,
  multiline = false,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        style={{
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          borderRadius: 8,
          padding: 10,
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          minHeight: multiline ? 80 : undefined,
        }}
      />
      {error ? (
        <Text style={{ color: colors.error, marginTop: 4, fontSize: 12 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
