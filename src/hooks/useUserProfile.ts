import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/library/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/utilities/types/database";

export type UserProfile = Tables<"Users">;

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useUserProfile(): UseUserProfileReturn {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user?.id, supabase]);

  return { profile, loading, error };
}
