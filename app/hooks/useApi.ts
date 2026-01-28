"use client";

import { useAuth } from "../contexts/AuthContext";
import { Movie } from "../types";

/**
 * Custom hook for making authenticated API calls
 */
export function useApi() {
  const { getIdToken } = useAuth();

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

  // Favorites
  const getFavorites = async () => {
    return makeRequest("/api/favorites");
  };

  const toggleFavorite = async (movie: Movie, action: "add" | "remove") => {
    return makeRequest("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ movie, action }),
    });
  };

  // Watchlist
  const getWatchlist = async () => {
    return makeRequest("/api/watchlist");
  };

  const toggleWatchlist = async (movie: Movie, action: "add" | "remove") => {
    return makeRequest("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ movie, action }),
    });
  };

  // Watched
  const getWatched = async () => {
    return makeRequest("/api/watched");
  };

  const toggleWatched = async (movie: Movie, action: "add" | "remove") => {
    return makeRequest("/api/watched", {
      method: "POST",
      body: JSON.stringify({ movie, action }),
    });
  };

  // Diary
  const getDiaryEntries = async () => {
    return makeRequest("/api/diary");
  };

  const createDiaryEntry = async (entry: {
    movie: Movie;
    watchedDate: string;
    rating?: number;
    review?: string;
    tags: string[];
    rewatch: boolean;
  }) => {
    return makeRequest("/api/diary", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  };

  const deleteDiaryEntry = async (entryId: string) => {
    return makeRequest(`/api/diary?id=${entryId}`, {
      method: "DELETE",
    });
  };

  // Lists
  const getLists = async () => {
    return makeRequest("/api/lists");
  };

  const createList = async (list: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    return makeRequest("/api/lists", {
      method: "POST",
      body: JSON.stringify(list),
    });
  };

  const updateList = async (params: {
    listId: string;
    name?: string;
    description?: string;
    isPublic?: boolean;
    addMovie?: Movie;
    removeMovie?: number;
    reorderMovies?: number[];
  }) => {
    return makeRequest("/api/lists", {
      method: "PATCH",
      body: JSON.stringify(params),
    });
  };

  const deleteList = async (listId: string) => {
    return makeRequest(`/api/lists?id=${listId}`, {
      method: "DELETE",
    });
  };

  // Profile
  const getProfile = async () => {
    return makeRequest("/api/profile");
  };

  const updateProfile = async (profile: {
    username?: string;
    handle?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    return makeRequest("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  };

  return {
    getFavorites,
    toggleFavorite,
    getWatchlist,
    toggleWatchlist,
    getWatched,
    toggleWatched,
    getDiaryEntries,
    createDiaryEntry,
    deleteDiaryEntry,
    getLists,
    createList,
    updateList,
    deleteList,
    getProfile,
    updateProfile,
  };
}
