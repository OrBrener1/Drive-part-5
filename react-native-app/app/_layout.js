// app/_layout.js

import { Stack } from "expo-router";
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/theme/themeContext";
import { CreateUIProvider } from "../src/context/CreateUIContext";
import SessionExpiredModal from "../src/components/sessionExpiredModal/SessionExpiredModal";

function SessionExpiredGate() {
  const { sessionExpired, confirmSessionExpired } = useContext(AuthContext);
  return (
    <SessionExpiredModal
      visible={sessionExpired}
      onConfirm={confirmSessionExpired}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <CreateUIProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <SessionExpiredGate />
          </CreateUIProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
