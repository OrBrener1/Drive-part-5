import { useLocalSearchParams, useRouter } from "expo-router";
import FilesScreen from "../../../../src/screens/Files/FilesScreen";

export default function FolderRoute() {
  const { id, origin, parent } = useLocalSearchParams();
  const router = useRouter();
  const originPath = typeof origin === "string" && origin.length > 0 ? origin : null;
  const parentId = typeof parent === "string" && parent.length > 0 ? parent : null;

  const handleBack = () => {
    if (parentId) {
      router.replace({
        pathname: "/private/(tabs)/folder/[id]",
        params: {
          id: parentId,
          origin: originPath ?? "",
          parent: "",
        },
      });
      return;
    }
    if (originPath) {
      router.replace(originPath);
      return;
    }
    router.back();
  };

  return (
    <FilesScreen
      parentId={id}
      origin={originPath}
      onBack={handleBack}
    />
  );
}
