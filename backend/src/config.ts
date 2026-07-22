/**
 * config.ts
 * Centralises all environment variables.
 * Import this instead of using process.env directly.
 */
export const config = {
  jwtSecret: process.env.JWT_SECRET || 'haica-super-secret-jwt-key-change-in-production',
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Refresh token lives 7 days
  refreshTokenExpiryDays: 7,
  // Bcrypt hashing rounds
  bcryptRounds: 10,
}
