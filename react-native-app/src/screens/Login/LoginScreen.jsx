import React, { useState, useContext, useMemo } from "react";
import {View, Text, TextInput, Pressable,} from "react-native";
import { ThemeContext } from "../../theme/themeContext";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import AuthCard from "../../components/auth/AuthCard";
import { createStyles } from "./LoginScreen.styles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );
  const { login } = useContext(AuthContext);
  const router = useRouter();

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

      if (!result.ok) {
        setError(result.message || "Login failed");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Keep your files in sync."
      footer={
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => router.push("/register")}
          >
            Create one
          </Text>
        </Text>
      }
    >
      {error ? <Text style={styles.formError}>{error}</Text> : null}

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
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
    </AuthCard>
  );
}
