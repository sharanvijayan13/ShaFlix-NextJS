"use client"

import Navbar from "../components/ui/Navbar";
import MovieCard from "../components/ui/MovieCard";
import { useMovieContext } from "../contexts/MovieContext";

export default function Home() {
  const { favorites } = useMovieContext();

  return (
    <div className="flex flex-col p-13 bg-black text-white min-h-screen">
      
      <h1 className="text-2xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      <Navbar />
      <h2 className="text-2xl font-bold mt-5 m-4">
        Favorites
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl mx-auto w-full py-1">
        {favorites.length === 0 ? (
          <p className="text-center col-span-full">No favorites yet.</p>
        ) : (
          favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="favs" />
          ))
        )}
      </div>
    </div>
  );
}
