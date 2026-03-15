import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/utilities/types/database";

export type EngineType = Tables<"Engine_type">;
export type EngineTypeInsert = TablesInsert<"Engine_type">;
export type EngineTypeUpdate = TablesUpdate<"Engine_type">;

interface UseEngineTypeReturn {
  engineTypes: EngineType[];
  loading: boolean;
  error: string | null;
  fetchEngineTypes: () => Promise<void>;
}

export function useEngineType(): UseEngineTypeReturn {
  const supabase = useMemo(() => createClient(), []);

  const [engineTypes, setEngineTypes] = useState<EngineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEngineTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Engine_type")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setEngineTypes(data);
    }

    setLoading(false);
  }, [supabase]);

  return { engineTypes, loading, error, fetchEngineTypes };
}
