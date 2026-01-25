import { useContext, useEffect, useRef } from "react";
import { Modal, View, Pressable, Text, Dimensions, Animated } from "react-native";
import { ThemeContext } from "../../Theme/themeContext";
import { createStyles } from "./BottomSheet.styles";

const { height } = Dimensions.get("window");

export default function BottomSheet({
  visible,
  onClose,
  titleLeft,
  onLeftPress,
  titleRight = "Finished",
  heightPercent = 0.65,
  children,
}) {
  // Access global theme
  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  // Animated value for slide-up motion
  const sheetHeight = height * heightPercent;
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  
  // Run slide-up / slide-down animation on visibility change
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);
  
  return (
      <Modal
        visible={visible}
        transparent
        animationType="none"       // Animation handled manually
        onRequestClose={onClose}   // Android back button support
      >
        {/* Dark overlay (visual only, not clickable) */}
        <View style={styles.overlay}>
          {/* Animated bottom sheet */}
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, transform: [{ translateY }] },
            ]}
          >
            {/* Header row */}
            <View style={styles.header}>
              {titleLeft ? (
                onLeftPress ? (
                  <Pressable onPress={onLeftPress} style={styles.headerLeftButton}>
                    <Text style={styles.headerLeft}>{titleLeft}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.headerLeft}>{titleLeft}</Text>
                )
              ) : (
                <View />
              )}
  
              {/* Explicit close action */}
              <Pressable onPress={onClose}>
                <Text style={styles.headerRight}>{titleRight}</Text>
              </Pressable>
            </View>
  
            {/* Sheet content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
  
