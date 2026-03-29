/**
 * useAuth — backwards-compatible hook.
 * Components that already import useAuth continue to work unchanged.
 * It re-exports everything from AuthContext so there is one source of truth.
 */
export { useAuthContext as useAuth } from "@/contexts/AuthContext";
export type { AppRole, AuthContextValue } from "@/contexts/AuthContext";
