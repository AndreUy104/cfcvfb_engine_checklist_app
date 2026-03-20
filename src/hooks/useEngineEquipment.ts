import { useMemo, useState } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  EngineEquipmentInsert,
  EngineEquipmentUpdate,
  EngineEquipmentWithDetails,
} from "@/utilities/types/engineEquipment.types";
import toast from "react-hot-toast";

interface UseEngineEquipmentReturn {
  assignments: EngineEquipmentWithDetails[];
  loading: boolean;
  error: string | null;
  fetchEquipmentByEngine: (engineId: number) => Promise<void>;
  assignEquipment: (data: EngineEquipmentInsert) => Promise<void>;
  unassignEquipment: (id: number) => Promise<void>;
  updateAssignment: (id: number, data: EngineEquipmentUpdate) => Promise<void>;
}

export function useEngineEquipment(): UseEngineEquipmentReturn {
  const supabase = useMemo(() => createClient(), []);

  const [assignments, setAssignments] = useState<EngineEquipmentWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipmentByEngine = async (engineId: number) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Engines_Equipment")
      .select(
        `
        *,
        Equipments (*)
      `,
      )
      .eq("engine_id", engineId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setAssignments(data as EngineEquipmentWithDetails[]);
    }

    setLoading(false);
  };

  const assignEquipment = async (data: EngineEquipmentInsert) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("Engines_Equipment").insert(data);

    if (error) {
      toast.error(error.message);
      setError(error.message);
    } else if (data.engine_id) {
      await fetchEquipmentByEngine(data.engine_id);
      toast.success("Equipment Assigned");
    }

    setLoading(false);
  };

  const unassignEquipment = async (id: number) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("Engines_Equipment")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }

    setLoading(false);
  };

  const updateAssignment = async (id: number, data: EngineEquipmentUpdate) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("Engines_Equipment")
      .update(data)
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
      );
    }

    setLoading(false);
  };

  return {
    assignments,
    loading,
    error,
    fetchEquipmentByEngine,
    assignEquipment,
    unassignEquipment,
    updateAssignment,
  };
}
