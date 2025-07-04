"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Movie } from "../types";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFavs = localStorage.getItem("favorites");
    const storedWatchlist = localStorage.getItem("watchlist");
    const storedWatched = localStorage.getItem("watched");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
    if (storedWatched) setWatched(JSON.parse(storedWatched));
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

  const addToFavorites = (movie: Movie) => {
    setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const removeFromFavorites = (movieId: number) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isFavorite = (movieId: number) => favorites.some((movie) => movie.id === movieId);

  const addToWatchlist = (movie: Movie) => {
    setWatchlist((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isInWatchlist = (movieId: number) => watchlist.some((movie) => movie.id === movieId);

  const addToWatched = (movie: Movie) => {
    setWatched((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const removeFromWatched = (movieId: number) => {
    setWatched((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isWatched = (movieId: number) => watched.some((movie) => movie.id === movieId);

  const value: MovieContextType = {
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
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
