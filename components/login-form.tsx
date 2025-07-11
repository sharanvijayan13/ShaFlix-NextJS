"use client"

import { useState } from "react"
import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Login to your account</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your email"
                  required
                  className="text-white placeholder:text-zinc-400 bg-zinc-900 border-zinc-700"
                />
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-sm text-[#1db954] hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pr-10 text-white placeholder:text-zinc-400 bg-zinc-900 border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <Button type="submit" className="w-full bg-[#1db954] hover:bg-[#169c46]">
                  Login
                </Button>
                <Button variant="outline" className="w-full border-zinc-700 text-white hover:text-[#1db954]">
                  Login with Google
                </Button>
              </div>
            </div>

            {/* Switch to signup */}
            <div className="mt-4 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <a href="/auth?mode=signup" className="underline underline-offset-4 text-[#1db954] hover:opacity-80">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
