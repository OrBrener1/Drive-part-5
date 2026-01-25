import React, { useContext, useMemo } from "react";
import { View, Text, Image, useWindowDimensions, ScrollView } from "react-native";
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
