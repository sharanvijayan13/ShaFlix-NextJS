"use client";

import Navbar from "../components/ui/Navbar";
import MovieCard from "../components/ui/MovieCard";
import { useMovieContext } from "../contexts/MovieContext";

export default function Home() {
  const { watched } = useMovieContext();

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      
      <h1 className="text-2xl md:text-3xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      <Navbar />
      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">
        Watched
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-8xl mx-auto w-full py-1">
        {watched.length === 0 ? (
          <p className="text-center col-span-full mt-1.5">No watched movies yet.</p>
        ) : (
          watched.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="watched" />
          ))
        )}
      </div>
    </div>
  );
}