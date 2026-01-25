import { apiFetch } from "./apiClient";
import { makeHttpError } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

async function apiFetchMultipart(path, options = {}) {
  console.log("MULTIPART FETCH:", path);
  return apiFetch(path, options);
}

// Create file / folder
// Endpoint: POST /files
export async function createItem({ name, type, parentId, content }) {
  const response = await apiFetch(API_ENDPOINTS.FILES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      parentId: parentId ?? null,
      ...(type !== "folder" ? { content: content ?? "" } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "CREATE_ITEM_FAILED",
      response.status,
      body
    );
  }

 return { ok: true };

}

// Upload file (with multipart/form-data)
// Endpoint: POST /files/upload
export async function uploadFile(file, parentId = null) {
  const formData = new FormData();

  const normalizedFile = {
  uri: file.uri.startsWith("file://")
    ? file.uri
    : file.uri,
  name: file.name || "image.jpg",
  type: file.mimeType || file.type || "image/jpeg",
};

formData.append("file", normalizedFile);


  if (parentId) {
    formData.append("parentId", parentId);
  }

  const response = await apiFetchMultipart(API_ENDPOINTS.UPLOAD_FILE, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "UPLOAD_FAILED", response.status, body);
  }

  return { ok: true };

}
// Replace image file (with multipart/form-data)
// Endpoint: PUT /files/:id/replace
export async function replaceImage(fileId, file) {
  if (!file?.uri) {
    throw makeHttpError("INVALID_FILE", 400, null);
  }

  const response = await fetch(file.uri);
  if (!response.ok) {
    throw makeHttpError("FILE_READ_FAILED", response.status, null);
  }

  const blob = await response.blob();
  const mimeType = file.mimeType || file.type || "image/jpeg";
  const dataUrl = await readBlobAsDataUrl(blob, mimeType);

  return updateFileContent(fileId, dataUrl);
}

function readBlobAsDataUrl(blob, mimeType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        return resolve(reader.result);
      }
      const prefix = `data:${mimeType};base64,`;
      return resolve(prefix);
    };
    reader.readAsDataURL(blob);
  });
}


// Fetch files by parent (root or folder)
// Endpoint: GET /files?parentId=...
export async function getFiles(parentId = null) {
  console.log("FETCH FILES parentId =", parentId);
  const url = parentId
    ? `${API_ENDPOINTS.FILES}?parentId=${parentId}`
    : API_ENDPOINTS.FILES;

  const res = await apiFetch(url);

  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

// Fetch single file / folder metadata
// Endpoint: GET /files/:id
export async function getFileById(fileId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`);

  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_FILE_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

// Download raw file bytes (protected)
// Endpoint: GET /files/:id/raw
export async function downloadFileRaw(fileId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}/raw`);
  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw makeHttpError("DOWNLOAD_FAILED", res.status, body);
  }

  return res.blob();
}
// Update file metadata/content
// Endpoint: PATCH /files/:id
export async function updateFileContent(fileId, content) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw makeHttpError(body?.error || "UPDATE_FILE_FAILED", res.status, body);
  }

  return true;
}

export async function updateFileName(fileId, name) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw makeHttpError(body?.error || "UPDATE_FILE_FAILED", res.status, body);
  }

  return true;
}


export async function getSharedFiles() {
  const res = await apiFetch(API_ENDPOINTS.SHARED_FILES);
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_SHARED_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getRecentFiles() {
  const res = await apiFetch(API_ENDPOINTS.RECENT_FILES);
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_RECENT_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getStarredFiles() {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}?starred=true`);
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_STARRED_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getBinFiles() {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/bin`);
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_BIN_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function searchFiles(query) {
  const q = String(query ?? "").trim();
  if (!q) return [];

  const res = await apiFetch(
    `${API_ENDPOINTS.SEARCH}/${encodeURIComponent(q)}`,
    { method: "GET" }
  );
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "SEARCH_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

async function readErrorMessage(res, fallback) {
  const body = await res.json().catch(() => ({}));
  return {
    message: body?.error || fallback,
    body,
  };
}

export async function toggleStar(itemId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}/star`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "TOGGLE_STAR_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function moveFileToBin(itemId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}/bin`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "MOVE_TO_BIN_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return true;
}

export async function restoreFileFromBin(itemId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}/restore`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "RESTORE_FROM_BIN_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return true;
}

export async function deleteFileForever(itemId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "DELETE_FOREVER_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return true;
}

// Descendants (for Move validation)
// Endpoint: GET /files/:id/descendants
export async function getDescendants(itemId) {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}/descendants`);
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_DESCENDANTS_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getPermissions(fileId) {
  const res = await apiFetch(API_ENDPOINTS.PERMISSIONS(fileId));
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "PERMISSIONS_FETCH_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function addPermission(fileId, email, type) {
  const res = await apiFetch(API_ENDPOINTS.PERMISSIONS(fileId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, type }),
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "ADD_PERMISSION_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function updatePermission(fileId, permissionId, type) {
  const res = await apiFetch(`${API_ENDPOINTS.PERMISSIONS(fileId)}/${permissionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "UPDATE_PERMISSION_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function removePermission(fileId, permissionId) {
  const res = await apiFetch(`${API_ENDPOINTS.PERMISSIONS(fileId)}/${permissionId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "REMOVE_PERMISSION_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.status === 204 ? true : res.json();
}

