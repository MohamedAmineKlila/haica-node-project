/**
 * sanitize — removes the password field from a user object.
 * Shared across auth and users services.
 */
export function sanitize(user: any) {
  const { password: _, ...safe } = user
  return safe
}
