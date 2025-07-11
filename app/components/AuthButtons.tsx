"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleAuth = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (user) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm text-white hidden sm:block">
          Hello, {user.user_metadata.full_name?.split(" ")[0] || "User"}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={handleAuth}>
        Login
      </Button>
      <Button variant="default" size="sm" asChild>
        <Link href="/auth?mode=signup">Signup</Link>
      </Button>
    </div>
  )
}
