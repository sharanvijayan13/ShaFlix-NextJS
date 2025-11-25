"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from "react";
import { Movie } from "../types";

export type DiaryEntry = {
  text: string;
  date: string;
};

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

  diaryEntries: Record<number, DiaryEntry>;
  saveDiaryEntry: (movieId: number, entry: string) => void;
  getDiaryEntry: (movieId: number) => DiaryEntry | undefined;
  hasDiaryEntry: (movieId: number) => boolean;
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
  const [diaryEntries, setDiaryEntries] = useState<Record<number, DiaryEntry>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFavs = localStorage.getItem("favorites");
    const storedWatchlist = localStorage.getItem("watchlist");
    const storedWatched = localStorage.getItem("watched");
    const storedDiary = localStorage.getItem("diaryEntries");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
    if (storedWatched) setWatched(JSON.parse(storedWatched));
    if (storedDiary) setDiaryEntries(JSON.parse(storedDiary));
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

  const saveDiaryEntry = useCallback((movieId: number, entry: string) => {
    setDiaryEntries((prev) => ({
      ...prev,
      [movieId]: {
        text: entry,
        date: new Date().toISOString(),
      },
    }));
  }, []);

  const getDiaryEntry = useCallback((movieId: number): DiaryEntry | undefined => {
    return diaryEntries[movieId];
  }, [diaryEntries]);

  const hasDiaryEntry = useCallback((movieId: number) => {
    return !!diaryEntries[movieId]?.text;
  }, [diaryEntries]);

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
    saveDiaryEntry,
    getDiaryEntry,
    hasDiaryEntry,
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
    saveDiaryEntry,
    getDiaryEntry,
    hasDiaryEntry,
  ]);

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
