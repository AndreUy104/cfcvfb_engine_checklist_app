import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  PowerToolInspectionWithDetails,
  PowerToolInspectionFormData,
} from "@/utilities/types/inspection.types";

interface UsePowerToolInspectionReturn {
  inspections: PowerToolInspectionWithDetails[];
  loading: boolean;
  error: string | null;
  fetchInspectionsByTool: (equipmentId: number) => Promise<void>;
  submitInspection: (
    equipmentId: number,
    form: PowerToolInspectionFormData,
  ) => Promise<boolean>;
}

export function usePowerToolInspection(): UsePowerToolInspectionReturn {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [inspections, setInspections] = useState<
    PowerToolInspectionWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInspectionsByTool = useCallback(
    async (equipmentId: number) => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("PowerTool_Inspections")
        .select(
          `
        *,
        Users (
          id,
          name,
          unit_number
        ),
        Equipments (
          id,
          name
        )
      `,
        )
        .eq("equipment_id", equipmentId)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setInspections(data as PowerToolInspectionWithDetails[]);
      }

      setLoading(false);
    },
    [supabase],
  );

  const submitInspection = useCallback(
    async (
      equipmentId: number,
      form: PowerToolInspectionFormData,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      // Resolve Users.id from auth_id
      const { data: userData } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_id", user?.id ?? "")
        .maybeSingle();

      if (!userData) {
        setError("User profile not found. Please contact your administrator.");
        setLoading(false);
        return false;
      }

      const { error: insertError } = await supabase
        .from("PowerTool_Inspections")
        .insert({
          equipment_id: equipmentId,
          inspected_by: userData.id,
          is_running: form.is_running,
          fuel_level: form.fuel_level || null,
          physical_condition: form.physical_condition || null,
          remarks: form.remarks || null,
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    },
    [supabase, user],
  );

  return {
    inspections,
    loading,
    error,
    fetchInspectionsByTool,
    submitInspection,
  };
}
