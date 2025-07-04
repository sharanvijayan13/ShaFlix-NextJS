"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/ui/Navbar";
import SearchBar from "./components/ui/SearchBar";
import MoodSelector from "./components/ui/MoodSelector";
import MovieCard from "./components/ui/MovieCard";
import { fetchMovies } from "./lib/api";
import { Movie } from "./types";

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  const maxButtons = 10;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center gap-3 mt-12 mb-10">
      <button
        className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
        onClick={() => setPage(1)}
        disabled={page === 1}
      >
        «
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`w-10 h-10 text-l rounded-none flex items-center justify-center font-semibold border-2 border-green-600 transition ${
            p === page
              ? "bg-white text-green-600 border-white" 
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
        onClick={() => setPage(totalPages)}
        disabled={page === totalPages}
      >
        »
      </button>
    </div>
  );
}

export default function Home() {
  const [mood, setMood] = useState("popular");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      try {
        const { results, total_pages } = await fetchMovies(mood.toLowerCase(), page, search);
        setMovies(results);
        setTotalPages(total_pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getMovies();
  }, [mood, page, search]);

  useEffect(() => {
    setPage(1);
  }, [mood, search]);

  const showSearch = search.trim().length > 0;
  const heading = showSearch
    ? `Search results for "${search}"`
    : `Top ${mood} movies`;

  return (
    <div className="flex flex-col p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-5">
        Shaflix: Mood-Based Movie Recommender
      </h1>

      <Navbar />
      <SearchBar value={search} onChange={setSearch} />
      <MoodSelector mood={mood} setMood={setMood} />

      <h2 className="text-2xl font-bold mt-5 m-4">{heading}</h2>

      {loading ? (
        <p className="m-5 mt-1.5 text-2xl">Loading movies......</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl ml-1.3 w-full py-1">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} page="discover" />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}
