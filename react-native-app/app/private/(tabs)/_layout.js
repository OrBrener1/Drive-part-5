import { useContext } from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../../src/Theme/ThemeContext";
import { CreateUIProvider } from "../../../src/context/CreateUIContext";

export default function TabsLayout() {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  return (
    <CreateUIProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="my-drive"
          options={{
            title: "My Drive",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="folder" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="shared"
          options={{
            title: "Shared",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="people" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="starred"
          options={{
            title: "Starred",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="star" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="folder/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </CreateUIProvider>
  );
}
