"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from "react";
import { Movie, Review, DiaryEntry, CustomList, UserProfile } from "../types";

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("watched", JSON.stringify(watched));
    }
  }, [watched]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
    }
  }, [diaryEntries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customLists", JSON.stringify(customLists));
    }
  }, [customLists]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Memoize ID sets for faster lookups
  const favoriteIds = useMemo(() => new Set(favorites.map(m => m.id)), [favorites]);
  const watchlistIds = useMemo(() => new Set(watchlist.map(m => m.id)), [watchlist]);
  const watchedIds = useMemo(() => new Set(watched.map(m => m.id)), [watched]);

  const addToFavorites = useCallback((movie: Movie) => {
    setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  }, []);

  const removeFromFavorites = useCallback((movieId: number) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  }, []);

  const isFavorite = useCallback((movieId: number) => favoriteIds.has(movieId), [favoriteIds]);

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  }, []);

  const removeFromWatchlist = useCallback((movieId: number) => {
    setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
  }, []);

  const isInWatchlist = useCallback((movieId: number) => watchlistIds.has(movieId), [watchlistIds]);

  const addToWatched = useCallback((movie: Movie) => {
    setWatched((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  }, []);

  const removeFromWatched = useCallback((movieId: number) => {
    setWatched((prev) => prev.filter((movie) => movie.id !== movieId));
  }, []);

  const isWatched = useCallback((movieId: number) => watchedIds.has(movieId), [watchedIds]);

  // Diary Entry Methods
  const addDiaryEntry = useCallback((entry: Omit<DiaryEntry, "id">) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}-${Math.random()}`,
    };
    setDiaryEntries((prev) => [...prev, newEntry]);
  }, []);

  const updateDiaryEntry = useCallback((id: string, entry: Partial<DiaryEntry>) => {
    setDiaryEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...entry } : e))
    );
  }, []);

  const removeDiaryEntry = useCallback((id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

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
  const createList = useCallback((list: Omit<CustomList, "id" | "createdAt" | "updatedAt">) => {
    const newList: CustomList = {
      ...list,
      id: `list-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomLists((prev) => [...prev, newList]);
  }, []);

  const updateList = useCallback((id: string, list: Partial<CustomList>) => {
    setCustomLists((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...list, updatedAt: new Date().toISOString() } : l
      )
    );
  }, []);

  const deleteList = useCallback((id: string) => {
    setCustomLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addMovieToList = useCallback((listId: string, movieId: number) => {
    setCustomLists((prev) =>
      prev.map((l) =>
        l.id === listId && !l.movieIds.includes(movieId)
          ? { ...l, movieIds: [...l.movieIds, movieId], updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, []);

  const removeMovieFromList = useCallback((listId: string, movieId: number) => {
    setCustomLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, movieIds: l.movieIds.filter((id) => id !== movieId), updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, []);

  const reorderListMovies = useCallback((listId: string, movieIds: number[]) => {
    setCustomLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, movieIds, updatedAt: new Date().toISOString() } : l
      )
    );
  }, []);

  // Profile Methods
  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  }, []);

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
