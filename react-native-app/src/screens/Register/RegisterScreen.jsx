import React, { useState, useContext, useMemo } from "react";
import {View, Text, TextInput, Pressable, Image, useWindowDimensions,} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { createStyles } from "./RegisterScreen.styles";

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
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, { width, height }), [colors, width, height]);

  const { register } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [imageName, setImageName] = useState(null);
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

  const isTouched = (field) =>
    touched[field] || submitAttempted;

  const statusColor = (valid, touched) => {
    if (valid) return { color: colors.success };
    if (touched) return { color: colors.error };
    return { color: colors.pending };
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

    router.replace("/login");

    } catch (e) {
    setError("Network error");
    } finally {
    setLoading(false);
    }
  };

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
    setImageName(asset.fileName ?? "profile-image");
  }
};

const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
  setError("Camera permission is required");
  return;
}

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    setImageBase64(asset.base64);
    setImageUri(asset.uri);
    setImageName("camera-photo");
     }
    };

const removeImage = () => {
  setImageBase64(null);
  setImageUri(null);
  setImageName(null);
    };

  return (
    <View style={styles.page}>
      <Image
        source={require("../../../assets/ogs-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Get started with your Drive workspace.
        </Text>

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
          onFocus={() => setTouched((p) => ({ ...p, email: true }))}
        />
        <Text style={[
          styles.validationText,
          statusColor(emailValid, isTouched("email")),
        ]}>
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
        <Text style={[
          styles.validationText,
          statusColor(nameValid, isTouched("name")),
        ]}>
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
        <Text style={[
          styles.validationText,
          statusColor(pwdLength, isTouched("password")),
        ]}>At least 8 characters</Text>
        <Text style={[
          styles.validationText,
          statusColor(pwdUpper, isTouched("password")),
        ]}>At least one uppercase letter</Text>
        <Text style={[
          styles.validationText,
          statusColor(pwdLower, isTouched("password")),
        ]}>At least one lowercase letter</Text>
        <Text style={[
          styles.validationText,
          statusColor(pwdNumber, isTouched("password")),
        ]}>At least one number</Text>

        {/* Confirm */}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          onFocus={() => setTouched((p) => ({ ...p, confirm: true }))}
        />
        <Text style={[
          styles.validationText,
          statusColor(passwordsMatch, isTouched("confirm")),
        ]}>
          Passwords match
        </Text>

        {/* Profile picture */}
        <Pressable style={styles.fileInput} onPress={pickImageFromLibrary}>
        <Text
            style={[
            styles.fileInputText,
            imageBase64 && styles.fileSelected,
            ]}
        >
            {imageBase64
            ? imageName
            : "Choose profile picture (optional)"}
        </Text>

        <Text style={styles.uploadIcon}>⬆️</Text>
        </Pressable>
        
        <Pressable onPress={takePhoto}>
         <Text style={styles.cameraLink}> 📷 Take a photo</Text>
        </Pressable>

        {imageBase64 && (
        <Pressable onPress={removeImage}>
            <Text style={styles.removeImage}>Remove image</Text>
        </Pressable>
        )}

        {imageUri && (
        <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
        />
        )}

        <Pressable
          style={[
            styles.button,
            !canSubmit && styles.buttonDisabled,
          ]}
          disabled={!canSubmit}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </Pressable>

        <Text
          style={styles.link}
          onPress={() => router.replace("/login")}
        >
          Already have an account? Sign in
        </Text>
      </View>
    </View>
  );
}
