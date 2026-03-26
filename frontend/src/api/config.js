// Backend API base URL
// In production, set VITE_BACKEND_URL env var OR edit the fallback below.
// For local dev, leave empty — Vite proxy handles it.
const raw = import.meta.env.VITE_BACKEND_URL || "";
export const BACKEND_URL = raw.replace(/\/+$/, ""); // strip trailing slashes
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
