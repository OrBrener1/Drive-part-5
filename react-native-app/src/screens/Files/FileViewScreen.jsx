import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, Alert } from "react-native";
import { router } from "expo-router";

import { getFileById } from "../../api/filesApi";
import FileViewer from "../../components/viewer/FileViewer";
import Screen from "../../components/layout/Screen";

export default function FileViewScreen() {
  const { id: fileId } = useLocalSearchParams();
  const [item, setItem] = useState(null);

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

  return <FileViewer item={item} onRefresh={loadItem} />;
}
