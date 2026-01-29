"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from "react";
import { Movie, Review, DiaryEntry, CustomList, UserProfile } from "../types";
import { useApi } from "../hooks/useApi";
import { useAuth } from "./AuthContext";

interface MovieContextType {
  favorites: Movie[];
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;

  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;

  watched: Movie[];
  addToWatched: (movie: Movie) => void;
  removeFromWatched: (movieId: number) => void;
  isWatched: (movieId: number) => boolean;

  // Enhanced diary with full entries
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, "id">) => void;
  updateDiaryEntry: (id: string, entry: Partial<DiaryEntry>) => void;
  removeDiaryEntry: (id: string) => void;
  getDiaryEntry: (movieId: number) => DiaryEntry | undefined;

  // Reviews & Ratings
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt" | "updatedAt" | "likes">) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  removeReview: (id: string) => void;
  getReview: (movieId: number) => Review | undefined;
  likeReview: (id: string) => void;

  // Custom Lists
  customLists: CustomList[];
  createList: (list: Omit<CustomList, "id" | "createdAt" | "updatedAt">) => void;
  updateList: (id: string, list: Partial<CustomList>) => void;
  deleteList: (id: string) => void;
  addMovieToList: (listId: string, movieId: number) => void;
  removeMovieFromList: (listId: string, movieId: number) => void;
  reorderListMovies: (listId: string, movieIds: number[]) => void;

  // User Profile
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const useMovieContext = (): MovieContextType => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieContext must be used within a MovieProvider");
  }
  return context;
};

interface MovieProviderProps {
  children: ReactNode;
}

export const MovieProvider = ({ children }: MovieProviderProps) => {
  const { user } = useAuth();
  const api = useApi();
  
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [watched, setWatched] = useState<Movie[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "",
    handle: "",
    bio: "",
    avatarUrl: "",
    stats: {
      moviesWatched: 0,
      diaryEntries: 0,
      favorites: 0,
      lists: 0,
      hoursWatched: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  // Load data from API when user is authenticated
  useEffect(() => {
    if (!user) {
      // Reset state when user logs out
      setFavorites([]);
      setWatchlist([]);
      setWatched([]);
      setDiaryEntries([]);
      setCustomLists([]);
      setUserProfile({
        username: "",
        handle: "",
        bio: "",
        avatarUrl: "",
        stats: {
          moviesWatched: 0,
          diaryEntries: 0,
          favorites: 0,
          lists: 0,
          hoursWatched: 0,
        },
      });
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load all user data in parallel
        const [
          favoritesData,
          watchlistData,
          watchedData,
          diaryData,
          listsData,
          profileData,
        ] = await Promise.all([
          api.getFavorites().catch(() => ({ favorites: [] })),
          api.getWatchlist().catch(() => ({ watchlist: [] })),
          api.getWatched().catch(() => ({ watched: [] })),
          api.getDiaryEntries().catch(() => ({ diaryEntries: [] })),
          api.getLists().catch(() => ({ lists: [] })),
          api.getProfile().catch(() => ({ profile: {
            username: "",
            handle: "",
            bio: "",
            avatarUrl: "",
            stats: { moviesWatched: 0, diaryEntries: 0, favorites: 0, lists: 0, hoursWatched: 0 }
          }})),
        ]);

        setFavorites(favoritesData.favorites || []);
        setWatchlist(watchlistData.watchlist || []);
        setWatched(watchedData.watched || []);
        setDiaryEntries(diaryData.diaryEntries || []);
        setCustomLists(listsData.lists || []);
        setUserProfile(profileData.profile);
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Fallback to localStorage for offline functionality
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, api]);

  // Fallback to localStorage (for offline functionality)
  const loadFromLocalStorage = () => {
    if (typeof window === "undefined") return;

    const storedFavs = localStorage.getItem("favorites");
    const storedWatchlist = localStorage.getItem("watchlist");
    const storedWatched = localStorage.getItem("watched");
    const storedDiary = localStorage.getItem("diaryEntries");
    const storedReviews = localStorage.getItem("reviews");
    const storedLists = localStorage.getItem("customLists");
    const storedProfile = localStorage.getItem("userProfile");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
    if (storedWatched) setWatched(JSON.parse(storedWatched));
    
    // Migrate old diary format (object) to new format (array)
    if (storedDiary) {
      const parsed = JSON.parse(storedDiary);
      if (Array.isArray(parsed)) {
        setDiaryEntries(parsed);
      } else {
        // Convert old Record<number, {text, date}> to new DiaryEntry[]
        const migratedEntries: DiaryEntry[] = Object.entries(parsed).map(([movieId, entry]) => {
          const oldEntry = entry as { text?: string; date?: string };
          return {
            id: `diary-migrated-${movieId}`,
            movieId: parseInt(movieId),
            watchedDate: oldEntry.date || new Date().toISOString(),
            review: oldEntry.text || "",
            tags: [],
            rewatch: false,
          };
        });
        setDiaryEntries(migratedEntries);
      }
    }
    
    if (storedReviews) setReviews(JSON.parse(storedReviews));
    if (storedLists) setCustomLists(JSON.parse(storedLists));
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
  };

  // Backup to localStorage (for offline functionality)
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("watched", JSON.stringify(watched));
    }
  }, [watched, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
    }
  }, [diaryEntries, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("customLists", JSON.stringify(customLists));
    }
  }, [customLists, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
  }, [userProfile, user]);

  // Memoize ID sets for faster lookups
  const favoriteIds = useMemo(() => new Set(favorites.map(m => m.id)), [favorites]);
  const watchlistIds = useMemo(() => new Set(watchlist.map(m => m.id)), [watchlist]);
  const watchedIds = useMemo(() => new Set(watched.map(m => m.id)), [watched]);

  const addToFavorites = useCallback(async (movie: Movie) => {
    if (!user) return;
    
    try {
      await api.toggleFavorite(movie, "add");
      setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      // Fallback to local state
      setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    }
  }, [api, user]);

  const removeFromFavorites = useCallback(async (movieId: number) => {
    if (!user) return;
    
    const movie = favorites.find(m => m.id === movieId);
    if (!movie) return;
    
    try {
      await api.toggleFavorite(movie, "remove");
      setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      // Fallback to local state
      setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
    }
  }, [api, user, favorites]);

  const isFavorite = useCallback((movieId: number) => favoriteIds.has(movieId), [favoriteIds]);

  const addToWatchlist = useCallback(async (movie: Movie) => {
    if (!user) return;
    
    try {
      await api.toggleWatchlist(movie, "add");
      setWatchlist((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      // Fallback to local state
      setWatchlist((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    }
  }, [api, user]);

  const removeFromWatchlist = useCallback(async (movieId: number) => {
    if (!user) return;
    
    const movie = watchlist.find(m => m.id === movieId);
    if (!movie) return;
    
    try {
      await api.toggleWatchlist(movie, "remove");
      setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      // Fallback to local state
      setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
    }
  }, [api, user, watchlist]);

  const isInWatchlist = useCallback((movieId: number) => watchlistIds.has(movieId), [watchlistIds]);

  const addToWatched = useCallback(async (movie: Movie) => {
    if (!user) return;
    
    try {
      await api.toggleWatched(movie, "add");
      setWatched((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    } catch (error) {
      console.error("Failed to add to watched:", error);
      // Fallback to local state
      setWatched((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
    }
  }, [api, user]);

  const removeFromWatched = useCallback(async (movieId: number) => {
    if (!user) return;
    
    const movie = watched.find(m => m.id === movieId);
    if (!movie) return;
    
    try {
      await api.toggleWatched(movie, "remove");
      setWatched((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Failed to remove from watched:", error);
      // Fallback to local state
      setWatched((prev) => prev.filter((movie) => movie.id !== movieId));
    }
  }, [api, user, watched]);

  const isWatched = useCallback((movieId: number) => watchedIds.has(movieId), [watchedIds]);

  // Diary Entry Methods
  const addDiaryEntry = useCallback(async (entry: Omit<DiaryEntry, "id">) => {
    if (!user) return;
    
    try {
      // Get movie details first
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${entry.movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const movie = await movieResponse.json();
      
      await api.createDiaryEntry({
        movie,
        watchedDate: entry.watchedDate,
        rating: entry.rating,
        review: entry.review,
        tags: entry.tags,
        rewatch: entry.rewatch,
      });
      
      const newEntry: DiaryEntry = {
        ...entry,
        id: `diary-${Date.now()}-${Math.random()}`,
      };
      setDiaryEntries((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Failed to add diary entry:", error);
      // Fallback to local state
      const newEntry: DiaryEntry = {
        ...entry,
        id: `diary-${Date.now()}-${Math.random()}`,
      };
      setDiaryEntries((prev) => [...prev, newEntry]);
    }
  }, [api, user]);

  const updateDiaryEntry = useCallback(async (id: string, entry: Partial<DiaryEntry>) => {
    if (!user) return;
    
    // Note: The API doesn't have an update endpoint, so we'll just update locally for now
    // You might want to add an update endpoint to your API
    setDiaryEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...entry } : e))
    );
  }, [user]);

  const removeDiaryEntry = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      await api.deleteDiaryEntry(id);
      setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to remove diary entry:", error);
      // Fallback to local state
      setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }, [api, user]);

  const getDiaryEntry = useCallback((movieId: number): DiaryEntry | undefined => {
    if (!Array.isArray(diaryEntries)) return undefined;
    return diaryEntries.find((e) => e.movieId === movieId);
  }, [diaryEntries]);

  // Review Methods
  const addReview = useCallback((review: Omit<Review, "id" | "createdAt" | "updatedAt" | "likes">) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
    };
    setReviews((prev) => [...prev, newReview]);
  }, []);

  const updateReview = useCallback((id: string, review: Partial<Review>) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...review, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  const removeReview = useCallback((id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getReview = useCallback((movieId: number): Review | undefined => {
    return reviews.find((r) => r.movieId === movieId);
  }, [reviews]);

  const likeReview = useCallback((id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  }, []);

  // Custom List Methods
  const createList = useCallback(async (list: Omit<CustomList, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    
    try {
      const response = await api.createList({
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
      });
      
      const newList: CustomList = {
        ...response.list,
        movieIds: list.movieIds,
      };
      
      // Add movies to the list if any
      if (list.movieIds.length > 0) {
        for (const movieId of list.movieIds) {
          try {
            // We need to get the movie object first
            const movieResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            const movie = await movieResponse.json();
            
            await api.updateList({
              listId: newList.id,
              addMovie: movie,
            });
          } catch (error) {
            console.error(`Failed to add movie ${movieId} to list:`, error);
          }
        }
      }
      
      setCustomLists((prev) => [...prev, newList]);
    } catch (error) {
      console.error("Failed to create list:", error);
      // Fallback to local state
      const newList: CustomList = {
        ...list,
        id: `list-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCustomLists((prev) => [...prev, newList]);
    }
  }, [api, user]);

  const updateList = useCallback(async (id: string, list: Partial<CustomList>) => {
    if (!user) return;
    
    try {
      await api.updateList({
        listId: id,
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
      });
      
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, ...list, updatedAt: new Date().toISOString() } : l
        )
      );
    } catch (error) {
      console.error("Failed to update list:", error);
      // Fallback to local state
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, ...list, updatedAt: new Date().toISOString() } : l
        )
      );
    }
  }, [api, user]);

  const deleteList = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      await api.deleteList(id);
      setCustomLists((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error("Failed to delete list:", error);
      // Fallback to local state
      setCustomLists((prev) => prev.filter((l) => l.id !== id));
    }
  }, [api, user]);

  const addMovieToList = useCallback(async (listId: string, movieId: number) => {
    if (!user) return;
    
    try {
      // Get movie details first
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const movie = await movieResponse.json();
      
      await api.updateList({
        listId,
        addMovie: movie,
      });
      
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId && !l.movieIds.includes(movieId)
            ? { ...l, movieIds: [...l.movieIds, movieId], updatedAt: new Date().toISOString() }
            : l
        )
      );
    } catch (error) {
      console.error("Failed to add movie to list:", error);
      // Fallback to local state
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId && !l.movieIds.includes(movieId)
            ? { ...l, movieIds: [...l.movieIds, movieId], updatedAt: new Date().toISOString() }
            : l
        )
      );
    }
  }, [api, user]);

  const removeMovieFromList = useCallback(async (listId: string, movieId: number) => {
    if (!user) return;
    
    try {
      await api.updateList({
        listId,
        removeMovie: movieId,
      });
      
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, movieIds: l.movieIds.filter((id) => id !== movieId), updatedAt: new Date().toISOString() }
            : l
        )
      );
    } catch (error) {
      console.error("Failed to remove movie from list:", error);
      // Fallback to local state
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, movieIds: l.movieIds.filter((id) => id !== movieId), updatedAt: new Date().toISOString() }
            : l
        )
      );
    }
  }, [api, user]);

  const reorderListMovies = useCallback(async (listId: string, movieIds: number[]) => {
    if (!user) return;
    
    try {
      await api.updateList({
        listId,
        reorderMovies: movieIds,
      });
      
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, movieIds, updatedAt: new Date().toISOString() } : l
        )
      );
    } catch (error) {
      console.error("Failed to reorder list movies:", error);
      // Fallback to local state
      setCustomLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, movieIds, updatedAt: new Date().toISOString() } : l
        )
      );
    }
  }, [api, user]);

  // Profile Methods
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      await api.updateProfile({
        username: profile.username,
        handle: profile.handle,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      });
      
      setUserProfile((prev) => ({ ...prev, ...profile }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Fallback to local state
      setUserProfile((prev) => ({ ...prev, ...profile }));
    }
  }, [api, user]);

  // Auto-update stats
  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        moviesWatched: watched.length,
        diaryEntries: diaryEntries.length,
        favorites: favorites.length,
        lists: customLists.length,
      },
    }));
  }, [watched.length, diaryEntries.length, favorites.length, customLists.length]);

  const value: MovieContextType = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    watched,
    addToWatched,
    removeFromWatched,
    isWatched,
    diaryEntries,
    addDiaryEntry,
    updateDiaryEntry,
    removeDiaryEntry,
    getDiaryEntry,
    reviews,
    addReview,
    updateReview,
    removeReview,
    getReview,
    likeReview,
    customLists,
    createList,
    updateList,
    deleteList,
    addMovieToList,
    removeMovieFromList,
    reorderListMovies,
    userProfile,
    updateProfile,
  }), [
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    watched,
    addToWatched,
    removeFromWatched,
    isWatched,
    diaryEntries,
    addDiaryEntry,
    updateDiaryEntry,
    removeDiaryEntry,
    getDiaryEntry,
    reviews,
    addReview,
    updateReview,
    removeReview,
    getReview,
    likeReview,
    customLists,
    createList,
    updateList,
    deleteList,
    addMovieToList,
    removeMovieFromList,
    reorderListMovies,
    userProfile,
    updateProfile,
  ]);

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
