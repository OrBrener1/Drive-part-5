// Reusable UI component: Create Menu Item.

import { Pressable, Text } from "react-native";

export default function CreateMenuItem({ label, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={typeof onPress !== "function"}
      style={{ paddingVertical: 12, opacity: typeof onPress === "function" ? 1 : 0.5 }}
    >
      <Text style={{ fontSize: 16, color }}>
        {label}
      </Text>
    </Pressable>
  );
}
