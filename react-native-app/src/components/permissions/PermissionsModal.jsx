import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import {
  addPermission,
  getPermissions,
  removePermission,
  updatePermission,
} from "../../api/filesApi";

const ROLE_OPTIONS = [
  { value: "READ", label: "Viewer" },
  { value: "WRITE", label: "Editor" },
  { value: "ADMIN", label: "Admin" },
];

const ROLE_LABELS = ROLE_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

function getInitials(name, email) {
  const base = (name || "").trim() || (email || "").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function RoleSelect({ value, onChange, disabled }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {ROLE_LABELS[value] || value}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  setOpen(false);
                  onChange(opt.value);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function PermissionsModal({ visible, item, onClose }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const { user: currentUser } = useContext(AuthContext);

  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("READ");
  const [isSharing, setIsSharing] = useState(false);

  const itemId = item?.id;
  const itemName = item?.name || "Item";
  const isFolder = item?.type === "folder";

  useEffect(() => {
    if (!visible || !itemId) return;
    let cancelled = false;
    setPermissions([]);
    setStatus("loading");
    setNotice(null);
    setNewEmail("");
    setNewRole("READ");
    setIsSharing(false);

    async function loadPermissions() {
      try {
        const res = await getPermissions(itemId);
        if (cancelled) return;
        setPermissions(res || []);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setNotice({
          type: "error",
          message: err?.message || "Failed to load permissions",
        });
      }
    }

    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [visible, itemId]);

  const noticeStyle = useMemo(() => {
    if (!notice) return null;
    const isError = notice.type === "error";
    return {
      backgroundColor: isError ? "rgba(229,57,53,0.12)" : "rgba(46,125,50,0.12)",
      borderColor: isError ? colors.error : colors.success,
      color: isError ? colors.error : colors.success,
    };
  }, [notice, colors.error, colors.success]);

  async function handleShare() {
    if (!newEmail.trim() || !itemId) return;
    setIsSharing(true);
    setNotice(null);
    try {
      const newPerm = await addPermission(itemId, newEmail.trim(), newRole);
      setPermissions((prev) => [...prev, newPerm]);
      setNewEmail("");
      setNewRole("READ");
      setNotice({ type: "success", message: "Access granted" });
      setStatus("success");
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to share",
      });
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRoleChange(permissionId, nextRole) {
    if (!itemId) return;
    setNotice(null);
    setPermissions((prev) =>
      prev.map((p) =>
        (p.id || p._id) === permissionId ? { ...p, type: nextRole } : p
      )
    );

    try {
      await updatePermission(itemId, permissionId, nextRole);
      setNotice({ type: "success", message: "Permission updated" });
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Failed to update permission",
      });
      try {
        const res = await getPermissions(itemId);
        setPermissions(res || []);
      } catch {
        setStatus("error");
      }
    }
  }

  function handleRemove(permissionId) {
    if (!itemId) return;
    Alert.alert(
      "Remove access",
      "Remove this user's access?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removePermission(itemId, permissionId);
              setPermissions((prev) =>
                prev.filter((p) => (p.id || p._id) !== permissionId)
              );
              setNotice({ type: "success", message: "Access removed" });
            } catch (err) {
              setNotice({
                type: "error",
                message: err?.message || "Failed to remove access",
              });
            }
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={Boolean(visible)}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Pressable onPress={onClose} hitSlop={8}>
            <MaterialIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
              Access & Permissions
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <MaterialIcons
                name={isFolder ? "folder" : "insert-drive-file"}
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
                numberOfLines={1}
              >
                {itemName}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
            Add people
          </Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <TextInput
              placeholder="Add people by email..."
              placeholderTextColor={colors.textSecondary}
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <RoleSelect value={newRole} onChange={setNewRole} />

              <Pressable
                onPress={handleShare}
                disabled={!newEmail.trim() || isSharing}
                style={{
                  marginLeft: "auto",
                  backgroundColor: !newEmail.trim() || isSharing ? colors.primaryDisabled : colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {isSharing ? "Sharing..." : "Share"}
                </Text>
              </Pressable>
            </View>
          </View>

          {notice && (
            <View
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                backgroundColor: noticeStyle?.backgroundColor,
                borderColor: noticeStyle?.borderColor,
              }}
            >
              <Text style={{ color: noticeStyle?.color, fontSize: 13 }}>
                {notice.message}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 24 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
              People with access
            </Text>

            {status === "loading" && (
              <Text style={{ marginTop: 12, color: colors.textSecondary }}>
                Loading...
              </Text>
            )}

            {status === "success" && (
              <View style={{ marginTop: 12, gap: 12 }}>
                {permissions.map((p) => {
                  const permId = p.id || p._id;
                  const isOwner = String(item?.ownerId) === String(p.userId);
                  const isMe = currentUser?.email && p.user?.email
                    ? currentUser.email === p.user.email
                    : false;
                  const displayName = p.user?.displayName || "Unknown";
                  const displayEmail = p.user?.email || "";
                  const initials = getInitials(displayName, displayEmail);

                  return (
                    <View
                      key={permId}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: colors.primary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          {initials}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontWeight: "600", fontSize: 14 }}>
                          {displayName} {isMe ? "(You)" : ""}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          {displayEmail}
                        </Text>
                      </View>

                      {isOwner ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          Owner
                        </Text>
                      ) : (
                        <RoleSelect
                          value={p.type}
                          onChange={(nextRole) => handleRoleChange(permId, nextRole)}
                        />
                      )}

                      {!isOwner && (
                        <Pressable onPress={() => handleRemove(permId)} hitSlop={8}>
                          <MaterialIcons name="close" size={18} color={colors.textSecondary} />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
