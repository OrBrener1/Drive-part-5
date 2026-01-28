// Reusable UI component: Loading State.

import { useContext, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Image, Text, View } from "react-native";
import { ThemeContext } from "../../theme/themeContext";

export default function LoadingState({ label }) {
  const { theme, mode } = useContext(ThemeContext);
  const { colors } = theme;
  const spin = useRef(new Animated.Value(0)).current;
  const spinStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: spin.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          }),
        },
      ],
    }),
    [spin]
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <Animated.View style={[spinStyle, { marginBottom: 10 }]}>
        <Image
          source={require("../../../assets/squirl.png")}
          style={{ width: 56, height: 56 }}
          accessibilityLabel="Loading"
        />
      </Animated.View>
      <ActivityIndicator color={colors.primary} />
      {label ? (
        <Text style={{ color: mode === "dark" ? "#ffffff" : colors.textSecondary, marginTop: 8 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
