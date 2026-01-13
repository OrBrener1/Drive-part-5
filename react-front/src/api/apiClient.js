import { API_ENDPOINTS } from "../constants/apiEndpoints";

const TOKEN_KEY = "jwt";
const BASE_URL = "http://localhost:5000/api";

/**
 * Reads the JWT token from localStorage.
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Stores or removes the JWT token in localStorage.
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Builds an Error object that also carries HTTP metadata.
 */
function makeHttpError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

/**
 * Wrapper around fetch that attaches Authorization header if JWT exists.
 * This is the central place to handle auth headers for all API calls.
 * All functions below should use this for making API requests.
 */
export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

// Files
export async function getFiles() {
  const response = await apiFetch(API_ENDPOINTS.FILES);

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Keep your old message to avoid breaking callers, but include status
    throw makeHttpError(body?.error || "FILES_FETCH_FAILED", response.status, body);
  }

  return response.json();
}

// Starred files
// Endpoint: GET /files?starred=true
export async function getStarredFiles() {
    const response = await apiFetch(`${API_ENDPOINTS.FILES}?starred=true`);
      
    if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }
    if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "STARRED_FILES_FETCH_FAILED", response.status, body);
  }
    return response.json();
}

// Shared with me
// Endpoint: GET /files/shared
export async function getSharedFiles() {
  const response = await apiFetch(API_ENDPOINTS.SHARED_FILES);

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "SHARED_FILES_FETCH_FAILED", response.status, body);
  }

  return response.json();
}

// Recent files
// Endpoint: GET /files/recent
export async function getRecentFiles() {
  const response = await apiFetch(API_ENDPOINTS.RECENT_FILES);

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "RECENT_FILES_FETCH_FAILED", response.status, body);
  }

  return response.json();
}

// Toggle star (file or folder)
// Endpoint: PATCH /files/:id/star
export async function toggleStar(itemId) {
   const response = await apiFetch(`${API_ENDPOINTS.FILES}/${itemId}/star`, {
    method: "PATCH",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "TOGGLE_STAR_FAILED", response.status, body);
  }

  return response.json();
}

// Bin files
// Endpoint: GET /files/bin
export async function getBinFiles() {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/bin`);

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "BIN_FILES_FETCH_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Bin actions

// Move file/folder to Bin
export async function moveFileToBin(fileId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}/bin`, {
    method: "PATCH",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "MOVE_TO_BIN_FAILED",
      response.status,
      body
    );
  }

  return true;
}

// Restore file/folder from Bin
export async function restoreFileFromBin(fileId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}/restore`, {
    method: "PATCH",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "RESTORE_FROM_BIN_FAILED",
      response.status,
      body
    );
  }

  return true;
}

// Permanently delete file/folder (only if already in Bin)
export async function deleteFileForever(fileId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "DELETE",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "DELETE_FOREVER_FAILED",
      response.status,
      body
    );
  }

  return true;
}

// Move file/folder
// Endpoint: POST /files/:id/move
// Body: { targetParentId }
export async function moveFile(fileId, targetParentId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetParentId: targetParentId ?? null,
    }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "MOVE_FILE_FAILED",
      response.status,
      body
    );
  }

  // 204 No Content
  return true;
}

// Move folders picker
// Endpoint: GET /folders
// Query: ?parentId=<id | null>
export async function getMoveFolders(parentId = null) {
  const query = parentId ? `?parentId=${parentId}` : "";
  const response = await apiFetch(
    `${API_ENDPOINTS.MOVE_FOLDERS}${query}`,
    { method: "GET" }
  );

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "MOVE_FOLDERS_FETCH_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Open file / folder by id
// Endpoint: GET /files/:id
export async function getFileById(fileId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "GET",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "OPEN_ITEM_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Update file content (partial update)
// Endpoint: PATCH /files/:id
// Body: { content }
export async function patchFileById(fileId, content) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "UPDATE_FILE_FAILED");
  }

  // PATCH returns 204 No Content
  return true;
}

// Update file or folder metadata (e.g., rename)
// Endpoint: PATCH /files/:id
// Body: { name }
export async function updateFile(fileId, payload) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "UPDATE_FILE_FAILED", response.status, body);
  }

  // PATCH returns 204 No Content
  return true;
}

// Upload file
// Endpoint: POST /files/upload
// Body: multipart/form-data
export async function uploadFile(file, parentId = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (parentId) {
    formData.append("parentId", parentId);
  }

  const response = await apiFetch(API_ENDPOINTS.UPLOAD_FILE, {
    method: "POST",
    body: formData,
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "UPLOAD_FAILED");
  }

  return response.json();
}

// Replace file content
// Endpoint: PUT /files/:id/replace
// Body: multipart/form-data
export async function replaceFile(fileId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(
    `${API_ENDPOINTS.FILES}/${fileId}/replace`,
    {
      method: "PUT",
      body: formData,
    }
  );

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "REPLACE_FILE_FAILED");
  }

  return true;
}



// Search
// Endpoint: GET /search/:query
export async function searchFiles(query) {
  const q = String(query ?? "").trim();

  if (!q) {
    return [];
  }

  const response = await apiFetch(
    `${API_ENDPOINTS.SEARCH}/${encodeURIComponent(q)}`,
    { method: "GET" }
  );

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "SEARCH_FAILED", response.status, body);
  }

  return response.json();
}

// Create file/folder
// Endpoint: POST /files
// Body: { name, type, parentId, content}
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
      ...(type === "file" ? { content: content ?? "" } : {}),
    }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    // Preserve your current semantic error messages
    if (response.status === 400) {
      // Invalid input (validation error)
      throw makeHttpError(body?.error || "BAD_REQUEST", 400, body);
    }

    // All other errors are treated as server errors (but keep status!)
    throw makeHttpError(body?.error || "SERVER_ERROR", response.status, body);
  }

  return response.json();
}

// Current user
export async function fetchCurrentUser() {
  const response = await apiFetch(API_ENDPOINTS.CURRENT_USER);

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error('FETCH_CURRENT_USER_FAILED');
  }

  return response.json();
}

// Theme preference
// Endpoint: GET /users/me/theme
export async function getThemePreference() {
  const response = await apiFetch(`${API_ENDPOINTS.CURRENT_USER}/theme`);

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "THEME_FETCH_FAILED", response.status, body);
  }

  return response.json();
}

// Endpoint: PUT /users/me/theme
export async function setThemePreference(theme) {
  const response = await apiFetch(`${API_ENDPOINTS.CURRENT_USER}/theme`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ theme }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "THEME_UPDATE_FAILED", response.status, body);
  }

  // 204 No Content
  return true;
}


// Permissions
// Endpoint: GET /files/:id/permissions

// 1. Get List
export async function getPermissions(fileId) {
  const response = await apiFetch(API_ENDPOINTS.PERMISSIONS(fileId));

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "PERMISSIONS_FETCH_FAILED", response.status, body);
  }

  return response.json();
}

// 2. Add Permission (Share)
export async function addPermission(fileId, email, type) {
  const response = await apiFetch(API_ENDPOINTS.PERMISSIONS(fileId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, type }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Handle typical errors: 404 (user not found), 409 (already exists)
    throw makeHttpError(body?.error || "ADD_PERMISSION_FAILED", response.status, body);
  }

  return response.json();
}

// 3. Update Permission (Change Role)
export async function updatePermission(fileId, permissionId, newType) {
  // Construct URL manually since API_ENDPOINTS.PERMISSIONS returns base path
  const url = `${API_ENDPOINTS.PERMISSIONS(fileId)}/${permissionId}`;
  
  const response = await apiFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: newType }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "UPDATE_PERMISSION_FAILED", response.status, body);
  }

  return response.json();
}

// 4. Remove Permission (Unshare)
export async function removePermission(fileId, permissionId) {
  const url = `${API_ENDPOINTS.PERMISSIONS(fileId)}/${permissionId}`;

  const response = await apiFetch(url, {
    method: "DELETE",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(body?.error || "REMOVE_PERMISSION_FAILED", response.status, body);
  }

  // DELETE often returns 204 No Content, so we check status before parsing JSON
  if (response.status === 204) {
    return true;
  }
  return response.json();
}

// Download raw file
// Endpoint: GET /files/:id/raw
export async function downloadFileRaw(fileId) {
  const response = await apiFetch(`${API_ENDPOINTS.FILES}/${fileId}/raw`, {
    method: "GET",
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => null);
    throw makeHttpError(
      "DOWNLOAD_FILE_FAILED",
      response.status,
      body
    );
  }

  return await response.blob();
}
