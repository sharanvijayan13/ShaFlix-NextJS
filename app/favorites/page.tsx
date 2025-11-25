"use client"

import Navbar from "../components/ui/Navbar";
import MovieCard from "../components/ui/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { useMovieContext } from "../contexts/MovieContext";
import { Heart } from "lucide-react";

export default function Home() {
  const { favorites } = useMovieContext();

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      
      <h1 className="text-2xl md:text-3xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      <Navbar />
      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">
        Favorites
      </h2>
      <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto items-start">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Start adding movies to your favorites by clicking the heart icon on any movie card."
            actionLabel="Discover Movies"
            actionHref="/"
          />
        ) : (
          favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="favs" />
          ))
        )}
      </div>
    </div>
  );
}
