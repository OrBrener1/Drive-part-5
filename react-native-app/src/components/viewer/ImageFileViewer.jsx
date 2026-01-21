import { ScrollView, Text } from "react-native";

export default function TextFileViewer({ item }) {
  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {item.content || ""}
      </Text>
    </ScrollView>
  );
}
