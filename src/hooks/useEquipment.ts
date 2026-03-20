import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
} from "@/utilities/types/equipment.types";
import toast from "react-hot-toast";

interface UseEquipmentReturn {
  equipments: Equipment[];
  powerTools: Equipment[];
  equipment: Equipment | null;
  loading: boolean;
  error: string | null;
  fetchEquipments: () => Promise<void>;
  fetchEquipment: (id: number) => Promise<void>;
  fetchPowerTools: () => Promise<void>;
  createEquipment: (data: EquipmentInsert) => Promise<boolean>;
  updateEquipment: (id: number, data: EquipmentUpdate) => Promise<boolean>;
  deleteEquipment: (id: number) => Promise<boolean>;
}

export function useEquipment(): UseEquipmentReturn {
  const supabase = useMemo(() => createClient(), []);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [powerTools, setPowerTools] = useState<Equipment[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setEquipments(data);
    }

    setLoading(false);
  };

  const fetchEquipment = async (id: number) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setEquipment(data);
    }

    setLoading(false);
  };

  const fetchPowerTools = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .eq("is_power_tool", true)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPowerTools(data);
    }

    setLoading(false);
  }, [supabase]);

  const createEquipment = async (data: EquipmentInsert): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("Equipments").insert(data);

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return false;
    }

    await fetchEquipments();
    toast.success("Equipment Added");
    setLoading(false);
    return true;
  };

  const updateEquipment = async (
    id: number,
    data: EquipmentUpdate,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("Equipments")
      .update(data)
      .eq("id", id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    await fetchEquipments();
    setLoading(false);
    return true;
  };

  const deleteEquipment = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("Equipments").delete().eq("id", id);

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return false;
    }

    setEquipments((prev) => prev.filter((e) => e.id !== id));
    setLoading(false);
    toast.success("Equipment Deleted");
    return true;
  };

  return {
    equipments,
    powerTools,
    equipment,
    loading,
    error,
    fetchEquipments,
    fetchEquipment,
    fetchPowerTools,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}
