import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../src/context/AuthContext";

export default function PrivateLayout() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/public/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
