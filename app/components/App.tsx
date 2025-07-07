"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "./ui/Navbar";
import SearchBar from "./ui/SearchBar";
import MoodSelector from "./ui/MoodSelector";
import MovieCard from "./ui/MovieCard";
import Pagination from "./ui/Pagination";
import { fetchMovies } from "../lib/api";
import { Movie } from "../types";
import { useSearchParams, useRouter } from "next/navigation";

const MainAppInner = () => {
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
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} page="discover" priority={i === 0} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
};

const MainApp = () => (
  <Suspense fallback={<div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen"><h1 className="text-2xl md:text-3xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1><p className="m-5 mt-1.5 text-xl md:text-2xl">Loading...</p></div>}>
    <MainAppInner />
  </Suspense>
);

export default MainApp; 