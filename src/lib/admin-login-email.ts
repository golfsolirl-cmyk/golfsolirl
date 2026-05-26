/** Must match server default in `server/admin-login-email.mjs`. */
export const DEFAULT_ADMIN_LOGIN_EMAIL = 'info@golfsolirl.com'

export const isAllowedAdminLoginEmail = (email: string) =>
  email.trim().toLowerCase() === DEFAULT_ADMIN_LOGIN_EMAIL
