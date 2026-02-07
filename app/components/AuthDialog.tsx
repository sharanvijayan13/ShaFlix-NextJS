"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Auth error:", error);
      // Provide user-friendly error messages
      const err = error as { code?: string; message?: string };
      const errorMessage = err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err?.code === "auth/user-not-found"
        ? "No account found with this email."
        : err?.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : err?.code === "auth/weak-password"
        ? "Password should be at least 6 characters."
        : err?.message || "Authentication failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (error) {
      console.error("Google sign in error:", error);
      // Don't show error if user simply closed the popup
      const err = error as { code?: string; message?: string };
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setError(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1F2428] border-[#2C3440] text-[#E5E7EB] p-0 overflow-hidden">
        {/* Clean Header */}
        <div className="p-8 pb-6 border-b border-[#2C3440]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-[#E5E7EB]">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <p className="text-sm text-[#9CA3AF] mt-1.5">
              {mode === "signin" 
                ? "Sign in to continue your movie journey" 
                : "Start tracking your favorite movies"}
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3.5 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] placeholder:text-[#6B7280] transition-colors"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] placeholder:text-[#6B7280] transition-colors"
                disabled={loading}
              />
              {mode === "signup" && (
                <p className="text-xs text-[#6B7280] mt-1.5">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-6 bg-[#00E054] hover:bg-[#00c248] text-[#14181C] font-semibold transition-colors border-0" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#2C3440]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1F2428] px-3 text-[#6B7280] font-medium tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-2.5 bg-[#14181C] border-[#2C3440] hover:border-[#00E054] hover:bg-[#14181C] text-[#E5E7EB] transition-colors"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </Button>

          <div className="text-center text-sm text-[#9CA3AF] mt-6 pt-6 border-t border-[#2C3440]">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-[#00E054] hover:text-[#00c248] font-medium transition-colors"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#00E054] hover:text-[#00c248] font-medium transition-colors"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
