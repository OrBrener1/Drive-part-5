// app/_layout.js

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/theme/themeContext";
import { CreateUIProvider } from "../src/context/CreateUIContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CreateUIProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </CreateUIProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
