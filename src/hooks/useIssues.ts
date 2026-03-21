import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/library/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  IssueWithDetails,
  IssueFormData,
  UpdateIssueFormData,
} from "@/utilities/types/issues.types";

interface UseIssuesReturn {
  issues: IssueWithDetails[];
  loading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  submitIssue: (form: IssueFormData) => Promise<boolean>;
  updateIssue: (id: number, form: UpdateIssueFormData) => Promise<boolean>;
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
        ReportedBy:reported_by (id, name, unit_number),
        UpdatedBy:updated_by (id, name),
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

  const updateIssue = useCallback(
    async (id: number, form: UpdateIssueFormData): Promise<boolean> => {
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

      const { error } = await supabase
        .from("Issues")
        .update({
          status: form.status,
          priority: form.priority,
          qa_by: form.qa_by || null,
          repaired_by: form.repaired_by || null,
          start_date: form.start_date,
          end_date: form.end_date,
          updated_by: userData.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? {
                ...issue,
                ...form,
                updated_by: userData.id,
                updated_at: new Date().toISOString(),
              }
            : issue,
        ),
      );
      setLoading(false);
      return true;
    },
    [supabase, user],
  );

  return {
    issues,
    loading,
    error,
    fetchIssues,
    submitIssue,
    updateIssue,
  };
}
