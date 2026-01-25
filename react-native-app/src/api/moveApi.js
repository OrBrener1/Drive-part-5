import { apiFetch, makeHttpError } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

/**
 * Move file or folder to a new parent.
 *
 * @param {string|number} itemId - id of the file/folder to move
 * @param {string|number|null} targetParentId - destination folder id (null = My Drive)
 */
export async function moveItemApi(itemId, targetParentId) {
  const response = await apiFetch(`/files/${itemId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetParentId: targetParentId ?? null,
    }),
  });

  if (!response.ok) {
    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    const err = new Error(body?.error || "MOVE_FILE_FAILED");
    err.status = response.status;
    err.body = body;
    throw err;
  }

  // Web API returns 204 No Content → same assumption here
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
