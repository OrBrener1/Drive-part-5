import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({
  children,
  style,
  contentStyle,
  safeAreaEdges = ["top"],
}) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={safeAreaEdges}>
      <View
        style={[
          {
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 16,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
