import { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";

import { getFileById } from "../../api/filesApi";
import FileViewer from "../../components/viewer/FileViewer";

export default function FileViewScreen({ fileId }) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    getFileById(fileId)
      .then(setItem)
      .catch(() => {
        Alert.alert(
          "Cannot open file",
          "File server is unavailable",
          [{ text: "OK", onPress: () => router.back() }]
        );
      });
  }, [fileId]);

  if (!item) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <FileViewer item={item} />;
}
