"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

export function useRequireAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.user) {
        router.push("/auth?mode=login")
      } else {
        setUser(data.session.user)
      }
      setChecking(false)
    }

    checkAuth()
  }, [router])

  return { user, checking }
}
