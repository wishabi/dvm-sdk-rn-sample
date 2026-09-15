/**
 * The Flipp client token, read from `.env` (gitignored — see `.env.example`).
 * Expo inlines `process.env.EXPO_PUBLIC_*` at build time, so the variable must
 * be referenced by its full literal name.
 */
export const DVM_CLIENT_TOKEN: string = (
  process.env.EXPO_PUBLIC_DVM_CLIENT_TOKEN ?? ''
).trim();
