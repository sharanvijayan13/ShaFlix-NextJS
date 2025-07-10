"use client";

import { useEffect, useState } from "react";
import Navbar from "./ui/Navbar";
import SearchBar from "./ui/SearchBar";
import MoodSelector from "./ui/MoodSelector";
import MovieCard from "./ui/MovieCard";
import { fetchMovies } from "../lib/api";
import { Movie } from "../types";
import { useSearchParams, useRouter } from "next/navigation";

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  const maxButtons = 5;
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
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ‹
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
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  );
}

export default function HomeContent({
  initialMovies = [],
  initialTotalPages = 1,
  initialMood = "popular",
  initialPage = 1,
  initialSearch = "",
}: {
  initialMovies?: Movie[];
  initialTotalPages?: number;
  initialMood?: string;
  initialPage?: number;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mood, setMood] = useState(initialMood);
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const moodParam = searchParams.get("mood") || "popular";
    const queryParam = searchParams.get("query") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    setMood(moodParam);
    setSearch(queryParam);
    setPage(pageParam);
  }, [searchParams]);

  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      try {
        const { results, total_pages } = await fetchMovies(
          mood.toLowerCase(),
          page,
          search
        );
        setMovies(results);
        setTotalPages(total_pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getMovies();

    const params = new URLSearchParams();
    if (mood && mood !== "popular") params.set("mood", mood);
    if (search) params.set("query", search);
    if (page > 1) params.set("page", page.toString());

    router.replace(`/?${params.toString()}`);
  }, [mood, page, search, router]);

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

      <h2 className="text-sm md:text-2xl font-bold mt-5 m-4 text-center md:text-left">
        {heading}
      </h2>

      {loading ? (
        <p className="m-5 mt-1.5 text-xl">Loading movies...</p>
      ) : (
        <>
          <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto">
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