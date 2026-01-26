/*
  Backend API endpoint paths.
  These paths are relative to the BASE_URL ("http://localhost:5000/api") defined in apiClient.
*/

export const API_ENDPOINTS = {
  LOGIN: '/tokens',
  REGISTER: '/users',
  FILES: '/files',
  UPLOAD_FILE: '/files/upload',
  SHARED_FILES: '/files/shared',
  RECENT_FILES: '/files/recent',
  SEARCH: '/search',
  CURRENT_USER: '/users/me',
  CURRENT_USER_AVATAR: '/users/me/avatar',
  PERMISSIONS: (fileId) => `/files/${fileId}/permissions`,
  MOVE_FOLDERS: '/folders'
};
