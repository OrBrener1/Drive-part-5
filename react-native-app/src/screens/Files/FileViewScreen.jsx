import { useEffect, useState } from "react";
import { Text, Alert } from "react-native";
import { router } from "expo-router";

import { getFileById } from "../../api/filesApi";
import FileViewer from "../../components/viewer/FileViewer";
import Screen from "../../components/layout/Screen";

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
      <Screen contentStyle={{ paddingTop: 16 }}>
        <Text>Loading...</Text>
      </Screen>
    );
  }

  return <FileViewer item={item} />;
}
