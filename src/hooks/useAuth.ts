import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/library/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  COOKIE_MAX_AGE,
  POSITION_COOKIE_KEY,
} from "@/utilities/constants/auth.constant";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthReturn {
  user: User | null;
  positionId: number | null;
  loading: boolean;
  error: string | null;
  isFirstLogin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  function getPositionFromCookie(): number | null {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${POSITION_COOKIE_KEY}=([^;]*)`),
    );
    if (!match) return null;
    const parsed = Number(decodeURIComponent(match[1]));
    return isNaN(parsed) ? null : parsed;
  }

  function setPositionCookie(positionId: number | null) {
    if (positionId) {
      document.cookie = `${POSITION_COOKIE_KEY}=${encodeURIComponent(positionId)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    } else {
      document.cookie = `${POSITION_COOKIE_KEY}=; max-age=0; path=/`;
    }
  }

  async function fetchPositionId(userId: string) {
    const cached = getPositionFromCookie();
    if (cached) {
      setPositionId(cached);
      return;
    }

    const { data } = await supabase
      .from("Users")
      .select("position_id")
      .eq("auth_id", userId)
      .single();

    const position = data?.position_id ?? null;
    setPositionId(position);
    setPositionCookie(position || null);
  }

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsFirstLogin(user?.user_metadata?.is_first_login === true);
      if (user) await fetchPositionId(user.id);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsFirstLogin(currentUser?.user_metadata?.is_first_login === true);

      if (currentUser) {
        if (!session) setPositionCookie(null);
        await fetchPositionId(currentUser.id);
      } else {
        setPositionCookie(null);
        setPositionId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const firstLogin = data.user?.user_metadata?.is_first_login === true;
    setUser(data.user);
    setIsFirstLogin(firstLogin);
    if (data.user) await fetchPositionId(data.user.id);
    setLoading(false);
    router.push("/Home");
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setUser(null);
    setPositionId(null);
    setIsFirstLogin(false);
    setLoading(false);
    router.push("/");
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { is_first_login: false },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    setIsFirstLogin(false);
    setLoading(false);
  };

  return {
    user,
    positionId,
    loading,
    error,
    isFirstLogin,
    login,
    logout,
    changePassword,
  };
}
