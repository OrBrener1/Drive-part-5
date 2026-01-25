import { useContext } from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
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
          tabBarLabelStyle: {
            fontSize: 11,
            lineHeight: 12,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: -2,
          },
          tabBarItemStyle: {
            paddingVertical: 6,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, lineHeight: size + 2 }}>
                🏠
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="my-drive"
          options={{
            title: "My Drive",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, lineHeight: size + 2 }}>
                📁
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="shared"
          options={{
            title: "Shared",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, lineHeight: size + 2 }}>
                👥
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="starred"
          options={{
            title: "Starred",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, lineHeight: size + 2 }}>
                ⭐
              </Text>
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
