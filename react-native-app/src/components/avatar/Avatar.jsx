import { useContext, useMemo } from "react";
import { View, Text, Image } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";

// Generate a deterministic background color based on user identity
function getAvatarColor(userId, colors) {
  if (!userId) return colors.primary;
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = [
    colors.primary,
    colors.success,
    colors.pending,
  ];
  return palette[hash % palette.length];
}

// Extract initials from display name or email
function getInitials(name, email) {
  const base = (name || email || "").trim();
  if (!base) return "?";
  return base[0].toUpperCase();
}

export default function Avatar({ user, size = "md" }) {
  // Access global theme tokens
  const { theme } = useContext(ThemeContext);
  const { colors, spacing, radius, typography } = theme;

  // Avatar size mapping using spacing tokens
  const sizeMap = {
    sm: spacing.lg,
    md: spacing.xl,
    lg: spacing.xl * 1.5,
    xl: spacing.xl * 2.5,
  };

  const dimension = sizeMap[size] || sizeMap.md;

  // Memoized background color for consistency
  const backgroundColor = useMemo(
    () => getAvatarColor(user?.id || user?.email, colors),
    [user, colors]
  );

  // If user has profile image – render it
  if (user?.image) {
    return (
      <Image
        source={{ uri: user.image }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: radius.round,
        }}
      />
    );
  }

  // Fallback: initials avatar
  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: radius.round,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: dimension * 0.4,
          fontWeight: "600",
        }}
      >
        {getInitials(user?.displayName, user?.email)}
      </Text>
    </View>
  );
}
