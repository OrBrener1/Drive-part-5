import { Pressable, Text } from "react-native";

export default function CreateMenuItem({ label, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingVertical: 12 }}
    >
      <Text style={{ fontSize: 16, color }}>
        {label}
      </Text>
    </Pressable>
  );
}
