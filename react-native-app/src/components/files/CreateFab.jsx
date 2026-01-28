// Reusable UI component: Create Fab.

import { useContext, useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
import { ThemeContext } from "../../theme/themeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CreateFab({
  onPress,
  bottomOffset = 20,
  active = false,
  hidden = false,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [active, progress]);

  const rotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      pointerEvents={hidden ? "none" : "auto"}
      style={{
        position: "absolute",
        right: 20,
        bottom: bottomOffset,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        zIndex: 10,
        opacity: hidden ? 0 : 1,
        transform: [{ scale }],
      }}
    >
      <Animated.Text
        style={{
          color: "#fff",
          fontSize: 28,
          transform: [{ rotate: rotation }],
        }}
      >
        +
      </Animated.Text>
    </AnimatedPressable>
  );
}
