import { Suspense } from "react";
import HomeContent from "./components/HomeContent";
import { fetchMovies } from "./lib/api";
import type { Movie } from "./types";

export default async function Home() {
  const initialMood = "popular";
  const initialPage = 1;
  const initialSearch = "";
  let results: Movie[] = [];
  let total_pages: number = 0;
  let error: string | null = null;
  try {
    const data = await fetchMovies(initialMood, initialPage, initialSearch);
    results = data.results;
    total_pages = data.total_pages;
  } catch (err) {
    error = (err instanceof Error ? err.message : String(err)) || "Unknown error";
  }

  if (error) {
    return (
      <div className="text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Shaflix: Mood-Based Movie Recommender</h1>
        <p className="text-red-500">Failed to load movies: {error}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <HomeContent
        initialMovies={results}
        initialTotalPages={total_pages}
        initialMood={initialMood}
        initialPage={initialPage}
        initialSearch={initialSearch}
      />
    </Suspense>
  );
}
