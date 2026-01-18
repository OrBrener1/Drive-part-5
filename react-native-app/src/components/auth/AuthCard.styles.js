import { StyleSheet } from "react-native";
import { ms } from "../../utils/scale";

export const createStyles = (colors, layout) => {
  const { width, height } = layout;

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: height * 0.04,
    },

    logo: {
      width: width * 0.38,
      height: width * 0.15,
      marginBottom: ms(14),
    },

    card: {
      width: "90%",
      maxWidth: ms(440),
      backgroundColor: colors.surface,
      padding: ms(22),
      borderRadius: ms(16),
    },

    title: {
      fontSize: ms(24),
      fontWeight: "600",
      textAlign: "center",
      color: colors.textPrimary,
    },

    subtitle: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: ms(6),
      marginBottom: ms(14),
      fontSize: ms(14),
    },

    content: {
      gap: ms(10),
    },

    footer: {
      marginTop: ms(16),
      alignItems: "center",
    },
  });
};
