"use client";

import { useEffect, useState } from "react";
import Navbar from "./ui/Navbar";
import SearchBar from "./ui/SearchBar";
import MoodSelector from "./ui/MoodSelector";
import SortFilter from "./ui/SortFilter";
import MovieCard from "./ui/MovieCard";
import MovieCardSkeleton from "./ui/MovieCardSkeleton";
import ErrorState from "./ui/ErrorState";
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
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");

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
      setError(null);
      try {
        const { results, total_pages } = await fetchMovies(
          mood.toLowerCase(),
          page,
          search
        );
        
        // Apply sorting
        let sortedResults = [...results];
        if (sortBy !== "default") {
          sortedResults.sort((a, b) => {
            switch (sortBy) {
              case "rating-desc":
                return (b.vote_average || 0) - (a.vote_average || 0);
              case "rating-asc":
                return (a.vote_average || 0) - (b.vote_average || 0);
              case "title-asc":
                return a.title.localeCompare(b.title);
              case "title-desc":
                return b.title.localeCompare(a.title);
              case "date-desc":
                return (b.release_date || "").localeCompare(a.release_date || "");
              case "date-asc":
                return (a.release_date || "").localeCompare(b.release_date || "");
              default:
                return 0;
            }
          });
        }
        
        setMovies(sortedResults);
        setTotalPages(total_pages);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch movies");
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
  }, [mood, page, search, sortBy, router]);

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
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
        <MoodSelector mood={mood} setMood={setMood} />
        <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      <h2 className="text-sm md:text-2xl font-bold mt-5 m-4 text-center md:text-left">
        {heading}
      </h2>

      {loading ? (
        <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto items-start">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto">
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setLoading(true);
              fetchMovies(mood.toLowerCase(), page, search)
                .then(({ results, total_pages }) => {
                  setMovies(results);
                  setTotalPages(total_pages);
                })
                .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch movies"))
                .finally(() => setLoading(false));
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-8xl w-full py-1 mx-auto items-start">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
              >
                <MovieCard movie={movie} page="discover" />
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}