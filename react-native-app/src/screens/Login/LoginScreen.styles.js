import { StyleSheet } from "react-native";
import { ms } from "../../utils/scale";

export const createStyles = (colors) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ms(10),
      padding: ms(14),
      marginTop: ms(12),
      color: colors.textPrimary,
      fontSize: ms(14),
    },

    validationText: {
      fontSize: ms(13),
      marginTop: ms(4),
      color: colors.textSecondary,
    },

    formError: {
      color: colors.error,
      marginBottom: ms(6),
      fontSize: ms(13),
      textAlign: "center",
    },

    button: {
      backgroundColor: colors.primary,
      padding: ms(16),
      borderRadius: ms(12),
      marginTop: ms(20),
      alignItems: "center",
    },

    buttonDisabled: {
      backgroundColor: colors.primaryDisabled,
    },

    buttonText: {
      color: "#ffffff",
      fontSize: ms(16),
      fontWeight: "600",
    },

    footerText: {
      color: colors.textSecondary,
      fontSize: ms(13),
    },

    footerLink: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: ms(13),
    },
  });
