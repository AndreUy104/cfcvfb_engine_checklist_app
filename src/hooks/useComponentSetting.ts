import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/library/supabase/client";

export interface ComponentSetting {
  id: string;
  component_key: string;
  label: string;
  description: string | null;
  is_enabled: boolean;
  updated_at: string;
}

const cache: Record<string, boolean> = {};
const pending: Record<string, Promise<boolean>> = {};

export function useComponentSetting(componentKey: string): {
  isEnabled: boolean;
  isLoading: boolean;
} {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (componentKey in cache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEnabled(cache[componentKey]);
      setIsLoading(false);
      return;
    }

    if (!pending[componentKey]) {
      const supabase = createClient();

      pending[componentKey] = Promise.resolve(
        supabase
          .from("component_settings")
          .select("is_enabled")
          .eq("component_key", componentKey)
          .single()
          .then(({ data, error }) => {
            const value = error ? true : (data?.is_enabled ?? true);
            cache[componentKey] = value;
            delete pending[componentKey];
            return value;
          }),
      );
    }

    pending[componentKey].then((value) => {
      setIsEnabled(value);
      setIsLoading(false);
    });
  }, [componentKey]);

  return { isEnabled, isLoading };
}

export function useComponentSettings() {
  const [settings, setSettings] = useState<ComponentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("component_settings")
      .select("id, component_key, label, description, is_enabled, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      setError("Failed to load component settings.");
      setSettings([]);
    } else {
      setSettings(data ?? []);
    }

    setLoading(false);
  }, [supabase]);

  const toggleSetting = useCallback(
    async (setting: ComponentSetting) => {
      setTogglingKey(setting.component_key);
      setError(null);
      setSuccessKey(null);

      const newValue = !setting.is_enabled;

      // Optimistic update
      setSettings((prev) =>
        prev.map((s) =>
          s.component_key === setting.component_key
            ? { ...s, is_enabled: newValue }
            : s,
        ),
      );

      const { error } = await supabase
        .from("component_settings")
        .update({ is_enabled: newValue })
        .eq("component_key", setting.component_key);

      if (error) {
        // Revert on failure
        setSettings((prev) =>
          prev.map((s) =>
            s.component_key === setting.component_key
              ? { ...s, is_enabled: setting.is_enabled }
              : s,
          ),
        );

        setError(`Failed to update "${setting.label}". Please try again.`);
      } else {
        // Update single-setting cache
        cache[setting.component_key] = newValue;
        delete pending[setting.component_key];

        setSuccessKey(setting.component_key);

        setTimeout(() => {
          setSuccessKey((current) =>
            current === setting.component_key ? null : current,
          );
        }, 2000);
      }

      setTogglingKey(null);
    },
    [supabase],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    togglingKey,
    error,
    successKey,
    fetchSettings,
    toggleSetting,
    setError,
  };
}
