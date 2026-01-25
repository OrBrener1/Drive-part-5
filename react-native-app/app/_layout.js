// app/_layout.js

import { Stack } from "expo-router";
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthContext, AuthProvider } from "../src/context/AuthContext.jsx";
import { ThemeProvider } from "../src/theme/themeContext.jsx";
import { CreateUIProvider } from "../src/context/CreateUIContext.js";
import { ViewModeProvider } from "../src/context/ViewModeContext.jsx";
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
            <ViewModeProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
              <SessionExpiredGate />
            </ViewModeProvider>
          </CreateUIProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
