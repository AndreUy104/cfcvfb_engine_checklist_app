import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/library/supabase/client"
import type { User } from "@supabase/supabase-js"

interface LoginCredentials {
  email: string
  password: string
}

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  isFirstLogin: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  changePassword: (newPassword: string) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsFirstLogin(user?.user_metadata?.is_first_login === true)
    }

    fetchUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async ({ email, password }: LoginCredentials) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const firstLogin = data.user?.user_metadata?.is_first_login === true
    setUser(data.user)
    setIsFirstLogin(firstLogin)
    setLoading(false)
    router.push("/Home")
  }

  const logout = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setUser(null)
    setIsFirstLogin(false)
    setLoading(false)
    router.push("/")
  }

  const changePassword = async (newPassword: string) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { is_first_login: false },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setUser(data.user)
    setIsFirstLogin(false)
    setLoading(false)
  }

  return { user, loading, error, isFirstLogin, login, logout, changePassword }
}