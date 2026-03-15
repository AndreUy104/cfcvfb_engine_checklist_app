import { useMemo, useState } from "react"
import { createClient } from "@/library/supabase/client"
import type {EngineInsert, EngineUpdate, EngineWithType } from "@/utilities/types/engine.types"


interface UseEngineReturn {
  engines: EngineWithType[]
  engine: EngineWithType | null
  loading: boolean
  error: string | null
  fetchEngines: () => Promise<void>
  fetchEngine: (id: number) => Promise<void>
  createEngine: (data: EngineInsert) => Promise<boolean>
  updateEngine: (id: number, data: EngineUpdate) => Promise<void>
  deleteEngine: (id: number) => Promise<void>
}

export function useEngine(): UseEngineReturn {
  const supabase = useMemo(() => createClient(), [])

  const [engines, setEngines] = useState<EngineWithType[]>([])
  const [engine, setEngine] = useState<EngineWithType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEngines = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("Engines")
      .select(`
        *,
        Engine_type (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setEngines(data as EngineWithType[])
    }

    setLoading(false)
  }

  const fetchEngine = async (id: number) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("Engines")
      .select(`
        *,
        Engine_type (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setEngine(data as EngineWithType)
    }

    setLoading(false)
  }

  const createEngine = async (data: EngineInsert): Promise<boolean> => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.from("Engines").insert(data)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false 
    }

    await fetchEngines()
    setLoading(false)
    return true 
  }

  const updateEngine = async (id: number, data: EngineUpdate) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("Engines")
      .update(data)
      .eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchEngines()
    }

    setLoading(false)
  }

  const deleteEngine = async (id: number) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("Engines")
      .delete()
      .eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      setEngines((prev) => prev.filter((e) => e.id !== id))
    }

    setLoading(false)
  }

  return {
    engines,
    engine,
    loading,
    error,
    fetchEngines,
    fetchEngine,
    createEngine,
    updateEngine,
    deleteEngine,
  }
}
