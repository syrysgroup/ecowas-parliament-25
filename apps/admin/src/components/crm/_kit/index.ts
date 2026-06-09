export { PageHeaderV2 } from "./PageHeaderV2";
export { FilterBar, type FilterChip } from "./FilterBar";
export { DataTable, type Column, type SortState, type DataTableProps } from "./DataTable";
export { DetailDrawer } from "./DetailDrawer";
export { EmptyStateV2 } from "./EmptyStateV2";
export { QuickActions, type QuickAction } from "./QuickActions";

/** Tiny helper to read URL flags like ?v2=1 / ?legacy=1 on the client. */
export function urlFlag(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}
