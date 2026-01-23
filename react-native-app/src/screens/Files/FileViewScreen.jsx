import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import FileViewer from "../../components/viewer/FileViewer";
import { getFileById } from "../../api/filesApi";

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
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <FileViewer item={item} onRefresh={loadItem} />;
}
