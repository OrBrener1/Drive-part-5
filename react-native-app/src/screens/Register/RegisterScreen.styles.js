// Screen component for Register Screen.styles view.

import { StyleSheet } from "react-native";
import { ms } from "../../utils/scale";

export const createStyles = (colors) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ms(10),
      padding: ms(12),
      marginTop: ms(12),
      color: colors.textPrimary,
      fontSize: ms(14),
    },

    validationText: {
      fontSize: ms(12),
      marginTop: ms(4),
      color: colors.textSecondary,
    },

    formError: {
      color: colors.error,
      marginTop: ms(6),
      textAlign: "center",
      fontSize: ms(13),
    },

    sectionLabel: {
      marginTop: ms(12),
      marginBottom: ms(6),
      color: colors.textSecondary,
      fontSize: ms(13),
    },

    imageActionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: ms(8),
    },

    imageActionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ms(12),
      paddingVertical: ms(10),
      gap: ms(4),
    },

    imageActionIcon: {
      fontSize: ms(15),
    },

    imageActionText: {
      color: colors.primary,
      fontWeight: "500",
      fontSize: ms(13),
    },

    imagePreview: {
      width: ms(80),
      height: ms(80),
      borderRadius: ms(40),
      alignSelf: "center",
      marginVertical: ms(10),
    },

    removeImage: {
      color: colors.error,
      textAlign: "center",
      marginTop: ms(4),
      fontSize: ms(13),
    },

    button: {
      backgroundColor: colors.primary,
      padding: ms(14),
      borderRadius: ms(12),
      marginTop: ms(20),
      alignItems: "center",
    },

    buttonDisabled: {
      backgroundColor: colors.primaryDisabled,
    },

    buttonText: {
      color: "#ffffff",
      fontSize: ms(15),
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
