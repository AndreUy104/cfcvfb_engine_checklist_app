import { createClient } from "@/library/supabase/client";

import { useEffect, useState } from "react";

const cache: Record<string, boolean> = {};
const pending: Record<string, Promise<boolean>> = {};

export function useComponentSetting(componentKey: string): {
  isEnabled: boolean;
  isLoading: boolean;
} {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Already cached — use it immediately
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
