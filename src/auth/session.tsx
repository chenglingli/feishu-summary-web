import { createContext, useContext } from "react";
import type { SessionInfo } from "../api/types";
export const SessionContext = createContext<SessionInfo | null>(null);
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session required");
  return value;
}
