// app/_layout.js

import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/theme/themeContext";
import { CreateUIProvider } from "../src/context/CreateUIContext";

export default function RootLayout() {
  return (
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
  );
}
