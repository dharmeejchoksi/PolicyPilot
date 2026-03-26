// API base URL — empty string in dev (Vite proxy handles it),
// full backend URL in production (set via VITE_API_URL env var)
export const API_BASE = import.meta.env.VITE_API_URL || ''
