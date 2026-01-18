import { apiFetch } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export async function getRootFiles() {
  const res = await apiFetch(API_ENDPOINTS.FILES);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("FETCH_FILES_FAILED");
  }

  return res.json();
}

export async function createFolder({ name, parentId = null }) {
  const res = await apiFetch(API_ENDPOINTS.FILES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "folder",
      name,
      parentId,
    }),
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("CREATE_FOLDER_FAILED");
  }

  return res.json();
}

export async function createFile({ name, parentId = null }) {
  const res = await apiFetch(API_ENDPOINTS.FILES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "file",
      name,
      parentId,
    }),
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error("CREATE_FILE_FAILED");
  }

  return res.json();
}

