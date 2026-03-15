import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  IssueWithDetails,
  IssueFormData,
  IssueStatus,
} from "@/utilities/types/issues.types";

interface UseIssuesReturn {
  issues: IssueWithDetails[];
  loading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  submitIssue: (form: IssueFormData) => Promise<boolean>;
  updateIssueStatus: (id: number, status: IssueStatus) => Promise<boolean>;
}

export function useIssues(): UseIssuesReturn {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [issues, setIssues] = useState<IssueWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("Issues")
      .select(
        `
        *,
        Users (id, name, unit_number),
        Engines (id, name),
        Equipment:equipment_id (id, name),
        PowerTool:power_tool_id (id, name)
    `,
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setIssues(data as unknown as IssueWithDetails[]);
    }

    setLoading(false);
  }, [supabase]);

  const submitIssue = useCallback(
    async (form: IssueFormData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_id", user?.id ?? "")
        .maybeSingle();

      if (!userData) {
        setError("User profile not found.");
        setLoading(false);
        return false;
      }

      const { error: insertError } = await supabase.from("Issues").insert({
        reported_by: userData.id,
        type: form.type,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        engine_id: form.engine_id,
        equipment_id: form.equipment_id,
        power_tool_id: form.power_tool_id,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return false;
      }

      await fetchIssues();
      setLoading(false);
      return true;
    },
    [supabase, user, fetchIssues],
  );

  const updateIssueStatus = useCallback(
    async (id: number, status: IssueStatus): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("Issues")
        .update({ status })
        .eq("id", id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      setIssues((prev) =>
        prev.map((issue) => (issue.id === id ? { ...issue, status } : issue)),
      );
      setLoading(false);
      return true;
    },
    [supabase],
  );

  return {
    issues,
    loading,
    error,
    fetchIssues,
    submitIssue,
    updateIssueStatus,
  };
}
