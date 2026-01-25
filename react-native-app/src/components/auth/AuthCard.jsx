import React, { useContext, useMemo } from "react";
import { View, Text, Image, useWindowDimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../theme/themeContext";
import { createStyles } from "./AuthCard.styles";

export default function AuthCard({ title, subtitle, children, footer }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  const layout = useWindowDimensions();

  const styles = useMemo(
    () => createStyles(colors, layout),
    [colors, layout]
  );

  return (
    <SafeAreaView style={styles.page} edges={["top", "bottom"]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={[
            withAlpha(colors.primary, 0.22),
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradient}
        />
        <LinearGradient
          colors={[
            withAlpha(colors.success, 0.18),
            "transparent",
          ]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradient}
        />
        <LinearGradient
          colors={[
            withAlpha(colors.primary, 0.18),
            "transparent",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradient}
        />
        <LinearGradient
          colors={[
            withAlpha(colors.success, 0.14),
            "transparent",
          ]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradient}
        />
      </View>
      <Image
        source={require("../../../assets/ogs-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {footer && (
          <View style={styles.footer}>{footer}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

function withAlpha(hex, alpha) {
  if (typeof hex !== "string") return hex;
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
