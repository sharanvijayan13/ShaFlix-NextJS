"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

/**
 * Custom hook to guard actions that require authentication
 * Returns a wrapper function that checks auth before executing the action
 */
export function useAuthGuard() {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  /**
   * Wraps an action callback with authentication check
   * If user is not authenticated, shows a toast and optionally triggers auth dialog
   * 
   * @param action - The callback to execute if user is authenticated
   * @param actionName - Optional name for the action (for better toast messages)
   * @returns A wrapped function that performs auth check before executing
   */
  const guardAction = <T extends (...args: any[]) => any>(
    action: T,
    actionName?: string
  ): ((...args: Parameters<T>) => ReturnType<T> | void) => {
    return (...args: Parameters<T>) => {
      if (!user) {
        // User is not authenticated - block the action
        const message = actionName 
          ? `Sign in to ${actionName}` 
          : "Sign in to add favorites or watchlist";
        
        toast.info(message, {
          action: {
            label: "Sign In",
            onClick: () => setShowAuthDialog(true),
          },
          duration: 4000,
        });
        
        return;
      }

      // User is authenticated - execute the action
      return action(...args);
    };
  };

  return {
    guardAction,
    isAuthenticated: !!user,
    showAuthDialog,
    setShowAuthDialog,
  };
}
