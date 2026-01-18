import React, { useState, useContext, useMemo } from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { ThemeContext } from "../../Theme/ThemeContext";
import { createStyles } from "./LoginScreen.styles";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { login } = useContext(AuthContext);
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Validation ----
  const isEmailValid = EMAIL_REGEX.test(email.trim().toLowerCase());
  const isPasswordPresent = password.length > 0;

  const canSubmit = isEmailValid && isPasswordPresent && !loading;

  const emailTouched = touched.email || submitAttempted;
  const passwordTouched = touched.password || submitAttempted;

 const getStatusColor = (isValid, isTouched) => {
  if (isValid) return { color: colors.success };
  if (isTouched) return { color: colors.error };
  return { color: colors.pending };
  };  

  // ---- Submit ----
  const handleLogin = async () => {
  setSubmitAttempted(true);
  setError("");
  setLoading(true);

  try {
    const result = await login(
      email.trim().toLowerCase(),
      password
    );
    console.log("LOGIN RESULT:", result);

    if (!result.ok) {
      setError(result.message || "Login failed");
    }
    if (result.ok) {
      console.log("ROUTING TO FILES");
      router.replace("/files");
    }
  } catch (e) {
    console.log("LOGIN ERROR:", e);
    setError("Unexpected error");
  } finally {
    console.log("LOGIN FINALLY");
    setLoading(false);
  }
};

  return (
    <View style={styles.page}>
      {/* Logo */}
      <Image
        source={require("../../../assets/ogs-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          Welcome back. Keep your files in sync.
        </Text>

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          onFocus={() =>
            setTouched((prev) => ({ ...prev, email: true }))
          }
          onBlur={() =>
            setTouched((prev) => ({ ...prev, email: true }))
          }
        />

        <Text
          style={[
            styles.validationText,
            getStatusColor(isEmailValid, emailTouched),
          ]}
        >
          Valid email format
        </Text>

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() =>
            setTouched((prev) => ({ ...prev, password: true }))
          }
          onBlur={() =>
            setTouched((prev) => ({ ...prev, password: true }))
          }
        />

        <Text
          style={[
            styles.validationText,
            getStatusColor(isPasswordPresent, passwordTouched),
          ]}
        >
          Password is required
        </Text>

        {/* Submit */}
        <Pressable
          style={[
            styles.button,
            !canSubmit && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
