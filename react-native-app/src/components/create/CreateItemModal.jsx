import { Modal, View, Text } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../../theme/themeContext";

import CreateItemInput from "./CreateItemInput";
import CreateItemActions from "./CreateItemActions";

export default function CreateItemModal({
  visible,
  type,
  name,
  content,
  nameError,
  createError,
  canSubmit,
  onNameChange,
  onContentChange,
  onSubmit,
  onCancel,
}) {

  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
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
          {/* Name */}
          <CreateItemInput
            value={name}
            onChange={onNameChange}
            placeholder={type === "folder" ? "Folder name" : "File name"}
            error={nameError}
          />

          {/* Content – only for files */}
          {type !== "folder" && (
            <CreateItemInput
              value={content}
              onChange={onContentChange}
              placeholder="Content (optional)"
              multiline
            />
          )}

          {/* Server / create error */}
          {createError ? (
            <Text
              style={{
                color: colors.error,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              {createError}
            </Text>
          ) : null}

          {/* ACTIONS*/}
          <CreateItemActions
            type={type}
            onSubmit={onSubmit}
            onCancel={onCancel}
            canSubmit={canSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}
