import { apiFetch, makeHttpError } from "./apiClient";
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

export async function getSharedFiles() {
  const res = await apiFetch(API_ENDPOINTS.SHARED_FILES);

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_SHARED_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getRecentFiles() {
  const res = await apiFetch(API_ENDPOINTS.RECENT_FILES);

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_RECENT_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getStarredFiles() {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}?starred=true`);

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "FETCH_STARRED_FILES_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.json();
}

export async function getBinFiles() {
  const res = await apiFetch(`${API_ENDPOINTS.FILES}/bin`);

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "RESTORE_FROM_BIN_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return true;
}

export async function getPermissions(fileId) {
  const res = await apiFetch(API_ENDPOINTS.PERMISSIONS(fileId));

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
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

  if (res.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
  if (!res.ok) {
    const { message, body } = await readErrorMessage(res, "REMOVE_PERMISSION_FAILED");
    throw makeHttpError(message, res.status, body);
  }

  return res.status === 204 ? true : res.json();
}

