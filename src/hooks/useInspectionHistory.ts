import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  InspectionWithDetails,
  PowerToolInspectionWithDetails,
} from "@/utilities/types/inspection.types";

interface UseInspectionHistoryReturn {
  engineInspections: InspectionWithDetails[];
  powerToolInspections: PowerToolInspectionWithDetails[];
  loading: boolean;
  error: string | null;
  fetchEngineInspections: (engineId?: number) => Promise<void>;
  fetchPowerToolInspections: () => Promise<void>;
}

export function useInspectionHistory(): UseInspectionHistoryReturn {
  const supabase = useMemo(() => createClient(), []);

  const [engineInspections, setEngineInspections] = useState<
    InspectionWithDetails[]
  >([]);
  const [powerToolInspections, setPowerToolInspections] = useState<
    PowerToolInspectionWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEngineInspections = useCallback(
    async (engineId?: number) => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("Inspections")
        .select(
          `
        *,
        Users (id, name, unit_number),
        Engines (id, name),
        Inspection_Equipment_Results (
          *,
          Engines_Equipment (
            *,
            Equipments (id, name)
          )
        )
      `,
        )
        .order("inspected_at", { ascending: false });

      if (engineId) query = query.eq("engine_id", engineId);

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setEngineInspections(data as InspectionWithDetails[]);
      }

      setLoading(false);
    },
    [supabase],
  );

  const fetchPowerToolInspections = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("PowerTool_Inspections")
      .select(
        `
        *,
        Users (id, name, unit_number),
        Equipments (id, name)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPowerToolInspections(data as PowerToolInspectionWithDetails[]);
    }

    setLoading(false);
  }, [supabase]);

  return {
    engineInspections,
    powerToolInspections,
    loading,
    error,
    fetchEngineInspections,
    fetchPowerToolInspections,
  };
}
