// Reusable UI component: Rename Modal.

import { useEffect, useRef, useContext } from "react";
import { Keyboard, Modal, Platform, Pressable, Text, TextInput, View, KeyboardAvoidingView } from "react-native";
import { ThemeContext } from "../../theme/themeContext";
import { useRenameItem } from "../../hooks/useRenameItem";

export default function RenameModal({
  visible,
  itemId,
  initialName,
  onClose,
  onSuccess,
}) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const inputRef = useRef(null);

  const { name, error, canSubmit, isSubmitting, onNameChange, submit } =
    useRenameItem({
      itemId,
      initialName,
      onSuccess: (newName) => {
        onSuccess?.(newName);
        onClose?.();
      },
    });

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
              Rename
            </Text>

            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={onNameChange}
              editable={!isSubmitting}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                color: colors.textPrimary,
              }}
            />

            {error ? (
              <Text style={{ color: colors.error, marginTop: 8, fontSize: 13 }}>
                {error}
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 16,
              }}
            >
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onClose?.();
                }}
                disabled={isSubmitting}
                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  submit();
                }}
                disabled={!canSubmit || isSubmitting}
                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
