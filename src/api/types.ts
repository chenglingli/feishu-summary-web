import type { components } from "./generated";
// Response types are generated from backend Pydantic models; do not duplicate fields here.
export type SessionInfo = components["schemas"]["SessionInfo"];
export type Settings = components["schemas"]["SettingsView"];
export type User = components["schemas"]["UserView"];
export type Run = components["schemas"]["RunView"] &
  Partial<components["schemas"]["RunDetail"]>;
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type Health = components["schemas"]["HealthView"];
