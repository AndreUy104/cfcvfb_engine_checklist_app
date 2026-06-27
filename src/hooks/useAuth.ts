import { useState, useEffect, useCallback, useMemo } from "react";
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

// --- Cookie helpers (module-level, no stale closure risk) ---

function getPositionFromCookie(): number | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${POSITION_COOKIE_KEY}=([^;]*)`),
  );
  if (!match) return null;
  const parsed = Number(decodeURIComponent(match[1]));
  return isNaN(parsed) ? null : parsed;
}

function setPositionCookie(positionId: number | null) {
  if (positionId != null) {
    document.cookie = `${POSITION_COOKIE_KEY}=${encodeURIComponent(positionId)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  } else {
    document.cookie = `${POSITION_COOKIE_KEY}=; max-age=0; path=/`;
  }
}

// ---

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // true on mount — init is async
  const [error, setError] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Stable reference — safe to call from the effect without re-subscribing
  const fetchPositionId = useCallback(
    async (userId: string) => {
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
      setPositionCookie(position);
    },
    [supabase],
  );

  const applyUser = useCallback(
    async (u: User | null) => {
      setUser(u);
      setIsFirstLogin(u?.user_metadata?.is_first_login === true);

      if (u) {
        await fetchPositionId(u.id);
      } else {
        setPositionId(null);
        setPositionCookie(null);
      }
    },
    [fetchPositionId],
  );

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      // getSession() reads from local storage — no network call, fast.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        // No local session at all — user is logged out
        setLoading(false);
        return;
      }

      // Check if the access token is expired (or about to expire within 60s)
      const expiresAt = session.expires_at ?? 0;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const isExpired = expiresAt - nowInSeconds < 60;

      if (isExpired) {
        // Token is expired — attempt a silent refresh before trusting the session
        const {
          data: { session: refreshed },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (cancelled) return;

        if (refreshError || !refreshed) {
          // Refresh failed — session is unrecoverable, sign the user out cleanly
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        await applyUser(refreshed.user);
      } else {
        await applyUser(session.user);
      }

      if (!cancelled) setLoading(false);
    };

    initSession();

    // Listen for auth events — Supabase auto-refreshes tokens in the background
    // and emits TOKEN_REFRESHED. Handling it here keeps our state in sync.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          await applyUser(session?.user ?? null);
          break;

        case "SIGNED_OUT":
          await applyUser(null);
          break;

        // PASSWORD_RECOVERY means the user clicked a reset link —
        // no state changes needed here, handled in changePassword
        default:
          break;
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, applyUser]);

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
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

      // onAuthStateChange fires SIGNED_IN after this, which calls applyUser.
      // Only handle navigation here.
      const firstLogin = data.user?.user_metadata?.is_first_login === true;
      setIsFirstLogin(firstLogin);
      setLoading(false);
      router.push("/Home");
    },
    [supabase, router],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // onAuthStateChange fires SIGNED_OUT which calls applyUser(null),
    // so we only need to handle navigation here.
    setLoading(false);
    router.push("/");
  }, [supabase, router]);

  const changePassword = useCallback(
    async (newPassword: string) => {
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
    },
    [supabase],
  );

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
