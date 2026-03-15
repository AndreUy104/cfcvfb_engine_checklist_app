import { useCallback, useMemo, useState } from "react"
import { createClient } from "@/library/supabase/client"
import type { Equipment, EquipmentInsert, EquipmentUpdate } from "@/utilities/types/equipment.types"

interface UseEquipmentReturn {
  equipments: Equipment[]
  powerTools: Equipment[] 
  equipment: Equipment | null
  loading: boolean
  error: string | null
  fetchEquipments: () => Promise<void>
  fetchEquipment: (id: number) => Promise<void>
  fetchPowerTools: () => Promise<void>
  createEquipment: (data: EquipmentInsert) => Promise<void>
  updateEquipment: (id: number, data: EquipmentUpdate) => Promise<void>
  deleteEquipment: (id: number) => Promise<void>
}

export function useEquipment(): UseEquipmentReturn {
  const supabase = useMemo(() => createClient(), [])

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [powerTools, setPowerTools] = useState<Equipment[]>([])
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipments = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .eq("is_power_tool", false)
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setEquipments(data)
    }

    setLoading(false)
  }

  const fetchEquipment = async (id: number) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setEquipment(data)
    }

    setLoading(false)
  }

  const fetchPowerTools = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("Equipments")
      .select("*")
      .eq("is_power_tool", true)
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setPowerTools(data)
    }

    setLoading(false)
  }, [supabase])

  const createEquipment = async (data: EquipmentInsert) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("Equipments")
      .insert(data)

    if (error) {
      setError(error.message)
    } else {
      await fetchEquipments()
    }

    setLoading(false)
  }

  const updateEquipment = async (id: number, data: EquipmentUpdate) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("Equipments")
      .update(data)
      .eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchEquipments()
    }

    setLoading(false)
  }

  const deleteEquipment = async (id: number) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from("Equipments")
      .delete()
      .eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      setEquipments((prev) => prev.filter((e) => e.id !== id))
    }

    setLoading(false)
  }

  return {
    equipments,
    powerTools,
    equipment,
    loading,
    error,
    fetchEquipments,
    fetchEquipment,
    fetchPowerTools,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  }
}