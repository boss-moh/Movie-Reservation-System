export const PATHS = {
  AUTH: {
    BASE: "/auth",
    REGISTER: "/register",
    LOGIN: "/login",
    PROMOTE: "/promote",
    REFRESH_TOKEN: "/refresh-token",
    DELETE_USER: "/users/:id",
    RESTORE_USER: "/users/restore/:id",
    GET_ALL_USERS: "/users",
    GET_USER_BY_ID: "/users/:id",
  }
} as const 