import { EquipmentCheck } from "@/utilities/types/engineCheck.types";

export interface CompartmentGroup {
  label: string;
  normalized: string;
  entries: EquipmentCheck[];
}

export function normalizeCompartment(
  location: string | null | undefined,
): string {
  if (!location) return "__no_compartment__";
  return location.trim().toLowerCase().replace(/\s+/g, " ");
}

export function groupByCompartment(
  checks: EquipmentCheck[],
): CompartmentGroup[] {
  const map = new Map<string, CompartmentGroup>();
  for (const check of checks) {
    const key = normalizeCompartment(check.location_on_truck);
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(check);
    } else {
      map.set(key, {
        label: check.location_on_truck?.trim() ?? "No compartment",
        normalized: key,
        entries: [check],
      });
    }
  }
  return Array.from(map.values());
}
