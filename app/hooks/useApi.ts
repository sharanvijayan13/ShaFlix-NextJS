"use client";

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Movie } from "../types";

/**
 * Custom hook for making authenticated API calls
 */
export function useApi() {
  const { getIdToken } = useAuth();

  return React.useMemo(() => {
    const makeRequest = async (url: string, options: RequestInit = {}) => {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }

      return response.json();
    };

    return {
      getFavorites: () => makeRequest("/api/favorites"),
      toggleFavorite: (movie: Movie, action: "add" | "remove") =>
        makeRequest("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ movie, action }),
        }),
      getWatchlist: () => makeRequest("/api/watchlist"),
      toggleWatchlist: (movie: Movie, action: "add" | "remove") =>
        makeRequest("/api/watchlist", {
          method: "POST",
          body: JSON.stringify({ movie, action }),
        }),
      getWatched: () => makeRequest("/api/watched"),
      toggleWatched: (movie: Movie, action: "add" | "remove") =>
        makeRequest("/api/watched", {
          method: "POST",
          body: JSON.stringify({ movie, action }),
        }),
      getDiaryEntries: () => makeRequest("/api/diary"),
      createDiaryEntry: (entry: {
        movie: Movie;
        watchedDate: string;
        rating?: number;
        review?: string;
        tags: string[];
        rewatch: boolean;
      }) => makeRequest("/api/diary", {
        method: "POST",
        body: JSON.stringify(entry),
      }),
      deleteDiaryEntry: (entryId: string) => makeRequest(`/api/diary?id=${entryId}`, {
        method: "DELETE",
      }),
      getLists: () => makeRequest("/api/lists"),
      createList: (list: {
        name: string;
        description?: string;
        isPublic: boolean;
      }) => makeRequest("/api/lists", {
        method: "POST",
        body: JSON.stringify(list),
      }),
      updateList: (params: {
        listId: string;
        name?: string;
        description?: string;
        isPublic?: boolean;
        addMovie?: Movie;
        removeMovie?: number;
        reorderMovies?: number[];
      }) => makeRequest("/api/lists", {
        method: "PATCH",
        body: JSON.stringify(params),
      }),
      deleteList: (listId: string) => makeRequest(`/api/lists?id=${listId}`, {
        method: "DELETE",
      }),
      getProfile: () => makeRequest("/api/profile"),
      updateProfile: (profile: {
        username?: string;
        handle?: string;
        bio?: string;
        avatarUrl?: string;
      }) => makeRequest("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
      }),
    };
  }, [getIdToken]);
}
