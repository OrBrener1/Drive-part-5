// Reusable UI component: Side Drawer.

import { Modal, Pressable, View } from "react-native";

export default function SideDrawer({
  visible,
  side = "left",
  onClose,
  children,
  contentStyle,
}) {
  if (!visible) return null;

  const isLeft = side === "left";

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            inset: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 280,
            paddingTop: 0,
            paddingHorizontal: 16,
            ...(isLeft ? { left: 0 } : { right: 0 }),
            ...(contentStyle || {}),
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
