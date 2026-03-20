import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EngineCheckFormData } from "@/utilities/types/engineCheck.types";
import { InspectionWithDetails } from "@/utilities/types/inspection.types";
import { TablesInsert } from "@/utilities/types/database";
import toast from "react-hot-toast";

interface UseInspectionReturn {
  inspections: InspectionWithDetails[];
  loading: boolean;
  error: string | null;
  fetchInspectionsByEngine: (engineId: number) => Promise<void>;
  submitInspection: (
    engineId: number,
    form: EngineCheckFormData,
  ) => Promise<boolean>;
}

export function useInspection(): UseInspectionReturn {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [inspections, setInspections] = useState<InspectionWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInspectionsByEngine = useCallback(
    async (engineId: number) => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("Inspections")
        .select(
          `
        *,
        Users (
          id,
          name,
          unit_number
        ),
        Inspection_Equipment_Results (
          *,
          Engines_Equipment (
            *,
            Equipments (
              id,
              name
            )
          )
        )
      `,
        )
        .eq("engine_id", engineId)
        .order("inspected_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setInspections(data as InspectionWithDetails[]);
      }

      setLoading(false);
    },
    [supabase],
  );

  const submitInspection = useCallback(
    async (engineId: number, form: EngineCheckFormData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      // Step 1 — get the current user's Users.id (not auth_id)
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_id", user?.id ?? "")
        .maybeSingle();

      if (userError) {
        setError(userError?.message ?? "Failed to create inspection.");
        return false;
      }

      if (!userData) {
        setError("User profile not found. Please contact your administrator.");
        setLoading(false);
        return false;
      }

      // Step 2 — insert the Inspections row
      const inspectionInsert: TablesInsert<"Inspections"> = {
        engine_id: engineId,
        inspected_by: userData.id,
        water_level: form.apparatusChecks.waterLevel,
        fuel_level: form.apparatusChecks.fuelLevel,
        lights_and_siren: form.apparatusChecks.lightsAndSiren,
        battery_status: form.apparatusChecks.batteryStatus,
        radio_status: form.apparatusChecks.communicationRadio,
        remarks: form.remarks || null,
      };

      const { data: inspection, error: inspectionError } = await supabase
        .from("Inspections")
        .insert(inspectionInsert)
        .select("id")
        .single();

      if (inspectionError || !inspection) {
        setError(inspectionError?.message ?? "Failed to create inspection.");
        setLoading(false);
        return false;
      }

      // Step 3 — insert equipment results in parallel
      if (form.equipmentChecks.length > 0) {
        const equipmentInserts: TablesInsert<"Inspection_Equipment_Results">[] =
          form.equipmentChecks.map((eq) => ({
            inspection_id: inspection.id,
            engine_equipment_id: eq.engineEquipmentId,
            status:
              eq.status === "Serviceable"
                ? true
                : eq.status === "Down"
                  ? false
                  : null,
            notes: eq.notes || null,
          }));

        const { error: equipmentError } = await supabase
          .from("Inspection_Equipment_Results")
          .insert(equipmentInserts);

        if (equipmentError) {
          setError(equipmentError.message);
          setLoading(false);
          toast.error(equipmentError.message);
          return false;
        }
      }
      toast.success("Inspection Submitted");
      setLoading(false);
      return true;
    },
    [supabase, user],
  );

  return {
    inspections,
    loading,
    error,
    fetchInspectionsByEngine,
    submitInspection,
  };
}
