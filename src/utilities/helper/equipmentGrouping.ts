type WithLocation = { location_on_truck?: string | null };

export interface CompartmentGroup<T extends WithLocation = WithLocation> {
  label: string;
  normalized: string;
  entries: T[];
}

export function normalizeCompartment(
  location: string | null | undefined,
): string {
  if (!location) return "__no_compartment__";
  return location.trim().toLowerCase().replace(/\s+/g, " ");
}

export function groupByCompartment<T extends WithLocation>(
  items: T[],
): CompartmentGroup<T>[] {
  const map = new Map<string, CompartmentGroup<T>>();
  for (const item of items) {
    const key = normalizeCompartment(item.location_on_truck);
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(item);
    } else {
      map.set(key, {
        label: item.location_on_truck?.trim() ?? "No compartment",
        normalized: key,
        entries: [item],
      });
    }
  }
  return Array.from(map.values());
}
