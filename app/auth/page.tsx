"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/app/lib/supabaseClient"
import { X } from "lucide-react"

function AuthFormWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "login"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        alert("Check your email to confirm your account!")
        router.push("/auth?mode=login")
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/")
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="relative w-full max-w-md rounded-xl border border-gray-800 bg-zinc-950 p-6 shadow-md space-y-6">
        {/* Close button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-zinc-400 hover:text-[#1db954] transition"
          aria-label="Close authentication form"
        >
          <X className="w-5 h-5" />
        </button>
  
        <h1 className="text-2xl font-bold text-center text-white">
          {mode === "signup" ? "Create an account" : "Login to Shaflix"}
        </h1>
  
        {/* Email & Password Fields */}
        <div className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your mail"
              className="text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
  
          <div className="space-y-4">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
  
        {error && <p className="text-red-500 text-sm">{error}</p>}
  
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1db954] hover:bg-[#169c46] text-white"
        >
          {loading
            ? mode === "signup"
              ? "Signing up..."
              : "Logging in..."
            : mode === "signup"
            ? "Create Account"
            : "Login"}
        </Button>
  
        <div className="text-center text-sm text-zinc-400">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                className="text-[#1db954] hover:underline"
                onClick={() => router.replace("/auth?mode=login")}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                className="text-[#1db954] hover:underline"
                onClick={() => router.replace("/auth?mode=signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthFormWithParams />
    </Suspense>
  )
}