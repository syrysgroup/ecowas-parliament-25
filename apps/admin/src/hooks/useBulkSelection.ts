import { useCallback, useMemo, useState } from "react";

/** Reusable bulk-selection state for admin list modules.
 *  Pass the current page of items (must have stable string `id`s).
 *  Selection persists across re-renders but resets when `reset()` is called. */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = !allSelected && ids.some((id) => selected.has(id));

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allHere = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allHere) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, [ids]);

  const reset = useCallback(() => setSelected(new Set()), []);

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.id)),
    [items, selected],
  );

  return {
    selected,
    selectedIds: Array.from(selected),
    selectedItems,
    selectedCount: selected.size,
    allSelected,
    someSelected,
    isSelected: (id: string) => selected.has(id),
    toggle,
    toggleAll,
    reset,
  };
}
