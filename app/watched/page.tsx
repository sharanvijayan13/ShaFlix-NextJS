"use client";

import Navbar from "../components/ui/Navbar";
import MovieCard from "../components/ui/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { useMovieContext } from "../contexts/MovieContext";
import { Eye } from "lucide-react";

export default function Home() {
  const { watched } = useMovieContext();

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      
      <h1 className="text-2xl md:text-3xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      <Navbar />
      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">
        Watched
      </h2>
      <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto items-start">
        {watched.length === 0 ? (
          <EmptyState
            icon={Eye}
            title="No watched movies yet"
            description="Mark movies as watched from your watchlist to keep track of what you've seen."
            actionLabel="View Watchlist"
            actionHref="/watchlist"
          />
        ) : (
          watched.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="watched" />
          ))
        )}
      </div>
    </div>
  );
}