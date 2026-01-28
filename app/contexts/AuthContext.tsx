"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  // Check if Firebase is configured
  const isFirebaseConfigured = auth !== null;

  // Sync localStorage data to backend on first login
  const syncLocalStorageData = useCallback(async (idToken: string) => {
    if (synced || !isFirebaseConfigured) return;

    try {
      // Read directly from localStorage instead of using MovieContext
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const watched = JSON.parse(localStorage.getItem("watched") || "[]");
      const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
      const customLists = JSON.parse(localStorage.getItem("customLists") || "[]");
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");

      const localData = {
        favorites,
        watchlist,
        watched,
        diaryEntries,
        customLists,
        profile: {
          username: userProfile.username || "Movie Lover",
          handle: userProfile.handle || "@movielover",
          bio: userProfile.bio || "",
          avatarUrl: userProfile.avatarUrl || "",
        },
      };

      // Only sync if there's data to sync
      const hasData = localData.favorites.length > 0 || 
                      localData.watchlist.length > 0 || 
                      localData.watched.length > 0 ||
                      localData.diaryEntries.length > 0 ||
                      localData.customLists.length > 0;

      if (hasData) {
        const response = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify(localData),
        });

        if (response.ok) {
          // Clear localStorage after successful sync
          localStorage.removeItem("favorites");
          localStorage.removeItem("watchlist");
          localStorage.removeItem("watched");
          localStorage.removeItem("diaryEntries");
          localStorage.removeItem("customLists");
          
          toast.success("Your data has been synced!");
        } else {
          const errorText = await response.text();
          console.error("Sync failed with status:", response.status, errorText);
          // Don't show error to user, just log it
        }
      }
      
      // Mark as synced regardless to prevent retry loops
      setSynced(true);
    } catch (error) {
      console.error("Failed to sync data:", error);
      // Mark as synced to prevent retry loops
      setSynced(true);
    }
  }, [synced, isFirebaseConfigured]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const token = await user.getIdToken();
        await syncLocalStorageData(token);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured, syncLocalStorageData]);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.error("Firebase is not configured");
      throw new Error("Firebase not configured");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.error("Firebase is not configured");
      throw new Error("Firebase not configured");
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      toast.error("Firebase is not configured");
      throw new Error("Firebase not configured");
    }
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google!");
    } catch (error) {
      // Don't show error if user simply closed the popup
      const err = error as { code?: string; message?: string };
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        const errorMessage = err?.message || "Failed to sign in with Google";
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error("Firebase is not configured");
      throw new Error("Firebase not configured");
    }
    try {
      await firebaseSignOut(auth);
      setSynced(false);
      toast.success("Signed out successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out";
      toast.error(errorMessage);
      throw error;
    }
  };

  const getIdToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      getIdToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
