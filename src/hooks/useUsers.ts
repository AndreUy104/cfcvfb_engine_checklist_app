import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import type {
  UserWithPosition,
  PositionRow,
} from "@/utilities/types/users.types";
import type { InspectionWithDetails } from "@/utilities/types/inspection.types";

interface UseAllUsersReturn {
  users: UserWithPosition[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAllUsers(): UseAllUsersReturn {
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<UserWithPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Users")
        .select(`*, Positions ( id, name )`)
        .order("unit_number", { ascending: true, nullsFirst: false });
      if (error) setError(error.message);
      else setUsers((data as UserWithPosition[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [supabase, refreshKey]);

  return { users, loading, error, refresh };
}

interface UseAllPositionsReturn {
  positions: PositionRow[];
  loading: boolean;
  error: string | null;
}

export function useAllPositions(): UseAllPositionsReturn {
  const supabase = useMemo(() => createClient(), []);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Positions")
        .select("*")
        .order("id", { ascending: true });
      if (error) setError(error.message);
      else setPositions(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  return { positions, loading, error };
}

interface UseUserByIdReturn {
  user: UserWithPosition | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  updateName: (name: string) => Promise<boolean>;
  updateUnitNumber: (unitNumber: number) => Promise<boolean>;
  updatePosition: (positionId: number) => Promise<boolean>;
  refresh: () => void;
}

export function useUserById(userId: number | undefined): UseUserByIdReturn {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<UserWithPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (userId === undefined) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Users")
        .select(`*, Positions ( id, name )`)
        .eq("id", userId)
        .maybeSingle();
      if (error) setError(error.message);
      else setUser(data as UserWithPosition | null);
      setLoading(false);
    };
    fetch();
  }, [userId, supabase, refreshKey]);

  const updateName = useCallback(
    async (name: string): Promise<boolean> => {
      if (userId === undefined) return false;
      setSaving(true);
      setSaveError(null);
      const { error } = await supabase
        .from("Users")
        .update({ name })
        .eq("id", userId);
      setSaving(false);
      if (error) {
        setSaveError(error.message);
        return false;
      }
      setUser((prev) => (prev ? { ...prev, name } : prev));
      return true;
    },
    [userId, supabase],
  );

  const updateUnitNumber = useCallback(
    async (unitNumber: number): Promise<boolean> => {
      if (userId === undefined) return false;
      setSaving(true);
      setSaveError(null);
      const { error } = await supabase
        .from("Users")
        .update({ unit_number: unitNumber })
        .eq("id", userId);
      setSaving(false);
      if (error) {
        setSaveError(error.message);
        return false;
      }
      setUser((prev) => (prev ? { ...prev, unit_number: unitNumber } : prev));
      return true;
    },
    [userId, supabase],
  );

  const updatePosition = useCallback(
    async (positionId: number): Promise<boolean> => {
      if (userId === undefined) return false;
      setSaving(true);
      setSaveError(null);
      const { error } = await supabase
        .from("Users")
        .update({ position_id: positionId })
        .eq("id", userId);
      setSaving(false);
      if (error) {
        setSaveError(error.message);
        return false;
      }
      refresh();
      return true;
    },
    [userId, supabase, refresh],
  );

  return {
    user,
    loading,
    error,
    saving,
    saveError,
    updateName,
    updateUnitNumber,
    updatePosition,
    refresh,
  };
}

interface UseUserInspectionsReturn {
  inspections: InspectionWithDetails[];
  loading: boolean;
  error: string | null;
}

export function useUserInspections(
  userId: number | undefined,
): UseUserInspectionsReturn {
  const supabase = useMemo(() => createClient(), []);
  const [inspections, setInspections] = useState<InspectionWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId === undefined) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Inspections")
        .select(
          `
          *,
          Engines ( id, name, plate_number ),
          Users ( id, name ),
          Inspection_Equipment_Results (
            id,
            status,
            notes,
            Engines_Equipment (
              id,
              location_on_truck,
              quantity_assigned,
              Equipments ( id, name )
            )
          )
        `,
        )
        .eq("inspected_by", userId)
        .order("inspected_at", { ascending: false })
        .limit(30);
      if (error) setError(error.message);
      else setInspections((data as InspectionWithDetails[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [userId, supabase]);

  return { inspections, loading, error };
}

interface InvitePayload {
  email: string;
  position_id: number;
}

interface UseInviteUserReturn {
  inviting: boolean;
  inviteError: string | null;
  inviteSuccess: boolean;
  sendInvite: (payload: InvitePayload) => Promise<boolean>;
  resetInviteState: () => void;
}

export function useInviteUser(): UseInviteUserReturn {
  const supabase = useMemo(() => createClient(), []);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const resetInviteState = useCallback(() => {
    setInviteError(null);
    setInviteSuccess(false);
  }, []);

  const sendInvite = useCallback(
    async ({ email, position_id }: InvitePayload): Promise<boolean> => {
      setInviting(true);
      setInviteError(null);
      setInviteSuccess(false);
      const { error } = await supabase.functions.invoke("invite-user", {
        body: { email, position_id },
      });
      setInviting(false);
      if (error) {
        setInviteError(
          error instanceof Error ? error.message : "Failed to send invite.",
        );
        return false;
      }
      setInviteSuccess(true);
      return true;
    },
    [supabase],
  );

  return { inviting, inviteError, inviteSuccess, sendInvite, resetInviteState };
}
