// src/api/apiEndpoints.js

/*
  Backend API endpoint paths.
  These paths are relative to the BASE_URL defined in apiClient.
*/

export const API_ENDPOINTS = {
  LOGIN: "/tokens",
  REGISTER: "/users",
  FILES: "/files",
  UPLOAD_FILE: "/files/upload",
  RAW_URL: (fileId) => `/files/${fileId}/raw-url`,
  SHARED_FILES: "/files/shared",
  RECENT_FILES: "/files/recent",
  SEARCH: "/search",
  CURRENT_USER: "/users/me",
  PERMISSIONS: (fileId) => `/files/${fileId}/permissions`,
  MOVE_FOLDERS: "/folders",
};
