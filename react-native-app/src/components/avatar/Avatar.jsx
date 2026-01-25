import { useContext, useMemo } from "react";
import { View, Text, Image } from "react-native";
import { ThemeContext } from "../../theme/themeContext";

// Generate a deterministic background color based on user identity
function getAvatarColor(userId, colors) {
  if (!userId) return colors.primary;
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = [colors.primary, colors.success, colors.pending];
  return palette[hash % palette.length];
}

// Extract initials from display name or email
function getInitials(name, email) {
  const base = (name || email || "").trim();
  if (!base) return "?";
  return base[0].toUpperCase();
}

export default function Avatar({ user, size = "md" }) {
  // Access global theme
  const { theme } = useContext(ThemeContext);
  const { colors, spacing} = theme;

  // Avatar size mapping using spacing tokens
  const sizeMap = {
    sm: spacing.lg,
    md: spacing.xl,
    lg: spacing.xl * 1.5,
    xl: spacing.xl * 5,
  };

  const dimension = sizeMap[size] || sizeMap.md;

  // Decorative ring (brand accent, not status indicator)
    const ringWidth = 3;
  const ringColor = colors.primary;

  const backgroundColor = useMemo(
    () => getAvatarColor(user?.id || user?.email, colors),
    [user, colors]
  );

  // Normalize base64 image to valid data URI
  const imageUri =
    user?.image &&
    (user.image.startsWith("data:image")
      ? user.image
      : `data:image/jpeg;base64,${user.image}`);

  return (
    <View
      style={{
        width: dimension + ringWidth * 2,
        height: dimension + ringWidth * 2,
        borderRadius: (dimension + ringWidth * 2) / 2,
        borderWidth: ringWidth,
        borderColor: ringColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          overflow: "hidden",
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontSize: dimension * 0.4,
              fontWeight: "600",
            }}
          >
            {getInitials(user?.displayName, user?.email)}
          </Text>
        )}
      </View>
    </View>
  );
}