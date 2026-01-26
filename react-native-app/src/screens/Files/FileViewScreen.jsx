import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getFileById } from "../../api/filesApi";
import FileViewer from "../../components/viewer/FileViewer";
import Screen from "../../components/layout/Screen";
import { ThemeContext } from "../../theme/themeContext";
import { useContext } from "react";

export default function FileViewScreen() {
  const { id: fileId } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;

  console.log("FILE VIEW SCREEN RENDER", fileId);

  async function loadItem() {
    if (!fileId) return;
    try {
      const data = await getFileById(fileId);
      setItem(data);
    } catch {
      Alert.alert(
        "Cannot open file",
        "File server is unavailable"
      );
    }
  }

  useEffect(() => {
    loadItem();
  }, [fileId]);

  if (!item) {
    return (
      <Screen contentStyle={{ paddingTop: 16 }}>
        <Text>Loading...</Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FileViewer item={item} onRefresh={loadItem} />
    </View>
  );
}
