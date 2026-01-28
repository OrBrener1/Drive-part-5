import React, { useState, useContext, useMemo } from "react";
import { View, Text, TextInput, Pressable, Image,} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { createStyles } from "./RegisterScreen.styles";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import AuthCard from "../../components/auth/AuthCard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = {
  length: (v) => v.length >= 8,
  upper: (v) => /[A-Z]/.test(v),
  lower: (v) => /[a-z]/.test(v),
  number: (v) => /[0-9]/.test(v),
};

export default function RegisterScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );
  const { register } = useContext(AuthContext);
  const router = useRouter();

  // ---- Form state ----
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Image ----
  const [imageBase64, setImageBase64] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  // ---- Validation ----
  const emailValid = EMAIL_REGEX.test(email.trim().toLowerCase());
  const nameValid = displayName.trim().length >= 2;

  const pwdLength = PASSWORD_REGEX.length(password);
  const pwdUpper = PASSWORD_REGEX.upper(password);
  const pwdLower = PASSWORD_REGEX.lower(password);
  const pwdNumber = PASSWORD_REGEX.number(password);
  const pwdValid = pwdLength && pwdUpper && pwdLower && pwdNumber;

  const passwordsMatch = password === confirm && confirm.length > 0;

  const canSubmit =
    emailValid &&
    nameValid &&
    pwdValid &&
    passwordsMatch &&
    !loading;

  const isTouched = (field) => touched[field] || submitAttempted;

  const statusColor = (valid, touched) => {
    if (valid) return { color: colors.success };
    if (touched) return { color: colors.error };
    return { color: colors.pending };
  };

  // ---- Image handlers ----
  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageBase64(asset.base64);
      setImageUri(asset.uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageBase64(asset.base64);
      setImageUri(asset.uri);
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImageUri(null);
  };

  // ---- Submit ----
  const handleRegister = async () => {
    setSubmitAttempted(true);
    setError("");

    if (!canSubmit) return;

    try {
      setLoading(true);
      const result = await register(
        email.trim().toLowerCase(),
        password,
        displayName.trim(),
        imageBase64
      );

      if (!result.ok) {
        setError(result.message || "Registration failed");
        return;
      }

      router.replace("/public/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Get started with your Drive workspace."
      footer={
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => router.replace("/public/login")}
          >
            Log in
          </Text>
        </Text>
      }
    >
      {error ? <Text style={styles.formError}>{error}</Text> : null}

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setTouched((p) => ({ ...p, email: true }))}
      />
      <Text
        style={[
          styles.validationText,
          statusColor(emailValid, isTouched("email")),
        ]}
      >
        Valid email format
      </Text>

      {/* Display Name */}
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        onFocus={() => setTouched((p) => ({ ...p, name: true }))}
      />
      <Text
        style={[
          styles.validationText,
          statusColor(nameValid, isTouched("name")),
        ]}
      >
        At least 2 characters
      </Text>

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onFocus={() => setTouched((p) => ({ ...p, password: true }))}
      />
      <Text style={[styles.validationText, statusColor(pwdLength, isTouched("password"))]}>
        At least 8 characters
      </Text>
      <Text style={[styles.validationText, statusColor(pwdUpper, isTouched("password"))]}>
        At least one uppercase letter
      </Text>
      <Text style={[styles.validationText, statusColor(pwdLower, isTouched("password"))]}>
        At least one lowercase letter
      </Text>
      <Text style={[styles.validationText, statusColor(pwdNumber, isTouched("password"))]}>
        At least one number
      </Text>

      {/* Confirm */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        onFocus={() => setTouched((p) => ({ ...p, confirm: true }))}
      />
      <Text
        style={[
          styles.validationText,
          statusColor(passwordsMatch, isTouched("confirm")),
        ]}
      >
        Passwords match
      </Text>

      {/* Profile Picture */}
      <Text style={styles.sectionLabel}>Choose profile picture</Text>

            <View style={styles.imageActionsRow}>
        <Pressable style={styles.imageActionBtn} onPress={pickImageFromLibrary}>
          <MaterialIcons name="cloud-upload" size={15} color={colors.primary} />
          <Text style={styles.imageActionText}>Upload from device</Text>
        </Pressable>

        <Pressable style={styles.imageActionBtn} onPress={takePhoto}>
          <MaterialIcons name="photo-camera" size={15} color={colors.primary} />
          <Text style={styles.imageActionText}>Take a picture</Text>
        </Pressable>
      </View>


      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <Pressable onPress={removeImage}>
            <Text style={styles.removeImage}>Remove image</Text>
          </Pressable>
        </>
      )}

      {/* Submit */}
      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>
          {loading ? "Registering..." : "Register"}
        </Text>
      </Pressable>
    </AuthCard>
  );
}
