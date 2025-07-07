"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/ui/Navbar";
import SearchBar from "./components/ui/SearchBar";
import MoodSelector from "./components/ui/MoodSelector";
import MovieCard from "./components/ui/MovieCard";
import { fetchMovies } from "./lib/api";
import { Movie } from "./types";
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
  // Compact version for mobile: Prev, 3 page numbers, Next
  const getCompactPages = () => {
    let pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page === 1) {
      pages = [1, 2, 3];
    } else if (page === totalPages) {
      pages = [totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [page - 1, page, page + 1];
    }
    // Clamp pages to valid range
    return pages.filter((p) => p >= 1 && p <= totalPages);
  };

  // Full version for desktop: 10 buttons
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
    <>
      {/* Compact version for mobile */}
      <div className="flex justify-center items-center gap-2 mt-12 mb-10 sm:hidden">
        <button
          className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          &lt;
        </button>
        {getCompactPages().map((p) => (
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
          &gt;
        </button>
      </div>
      {/* Full version for desktop */}
      <div className="hidden sm:flex justify-center items-center gap-3 mt-12 mb-10">
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
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mood, setMood] = useState("popular");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Sync state with URL params on mount
  useEffect(() => {
    const moodParam = searchParams.get("mood") || "popular";
    const queryParam = searchParams.get("query") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    setMood(moodParam);
    setSearch(queryParam);
    setPage(pageParam);
  }, [searchParams]);

  // Fetch movies on change
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

    // Update URL Params
    const params = new URLSearchParams();
    if (mood && mood !== "popular") params.set("mood", mood);
    if (search) params.set("query", search);
    if (page > 1) params.set("page", page.toString());

    router.replace(`/?${params.toString()}`);
  }, [mood, page, search, router]);

  // Reset to page 1 if mood/search changes
  useEffect(() => {
    setPage(1);
  }, [mood, search]);

  const showSearch = search.trim().length > 0;
  const heading = showSearch
    ? `Search results for "${search}"`
    : `Top ${mood} movies`;

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-5">
        Shaflix: Mood-Based Movie Recommender
      </h1>

      <Navbar />
      <SearchBar value={search} onChange={setSearch} />
      <MoodSelector mood={mood} setMood={setMood} />

      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">{heading}</h2>

      {loading ? (
        <p className="m-5 mt-1.5 text-xl md:text-2xl">Loading movies......</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-8xl mx-auto w-full py-1">
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
