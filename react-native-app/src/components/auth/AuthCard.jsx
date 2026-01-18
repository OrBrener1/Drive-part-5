import React, { useContext, useMemo } from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";
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
    <View style={styles.page}>
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

        <View style={styles.content}>{children}</View>

        {footer && (
          <View style={styles.footer}>{footer}</View>
        )}
      </View>
    </View>
  );
}
