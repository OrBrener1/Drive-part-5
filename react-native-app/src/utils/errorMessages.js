const STATUS_MESSAGES = {
  400: "Bad request. Check your input.",
  401: "Session expired. Please log in again.",
  403: "You do not have permission to do this.",
  404: "Item not found.",
  409: "Conflict. Please try again.",
  500: "Server error. Please try again later.",
  502: "Service error. Please try again later.",
  503: "File server is unavailable. Please try again later.",
};

const CODE_MESSAGES = {
  NETWORK_TIMEOUT: "Network timeout. Check your connection.",
  UNAUTHORIZED: "Session expired. Please log in again.",
  FETCH_FILES_FAILED: "Couldn't load files.",
  FETCH_SHARED_FILES_FAILED: "Couldn't load shared files.",
  FETCH_RECENT_FILES_FAILED: "Couldn't load recent files.",
  FETCH_STARRED_FILES_FAILED: "Couldn't load starred files.",
  FETCH_BIN_FILES_FAILED: "Couldn't load bin items.",
  SEARCH_FAILED: "Search failed. Try again.",
  CREATE_FOLDER_FAILED: "Couldn't create folder.",
  CREATE_FILE_FAILED: "Couldn't create file.",
  CREATE_ITEM_FAILED: "Couldn't create item.",
  MOVE_TO_BIN_FAILED: "Couldn't move item to bin.",
  RESTORE_FROM_BIN_FAILED: "Couldn't restore item.",
  TOGGLE_STAR_FAILED: "Couldn't update star.",
  PERMISSIONS_FETCH_FAILED: "Couldn't load permissions.",
  ADD_PERMISSION_FAILED: "Couldn't share item.",
  UPDATE_PERMISSION_FAILED: "Couldn't update permission.",
  REMOVE_PERMISSION_FAILED: "Couldn't remove permission.",
  CPP_ERROR: "File server is unavailable. Please try again later.",
};

const AUTH_STATUS_MESSAGES = {
  400: "Invalid email or password format.",
  401: "Invalid email or password.",
  409: "User already exists.",
};

export function getErrorMessage(err, options = {}) {
  const { fallback = "Something went wrong.", context } = options;

  if (!err) return fallback;

  const status = err.status;
  const code = err.message;

  if (context === "auth" && status && AUTH_STATUS_MESSAGES[status]) {
    return AUTH_STATUS_MESSAGES[status];
  }

  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];

  const bodyError = err.body?.error;
  if (bodyError) return String(bodyError);

  if (code) return String(code);
  return fallback;
}
