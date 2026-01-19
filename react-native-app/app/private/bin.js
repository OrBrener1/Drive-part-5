// app/bin.js
import { useContext } from "react";
import { Redirect } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import BinScreen from "../../src/screens/Bin/BinScreen";

export default function BinScreen() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <BinScreen />;
}