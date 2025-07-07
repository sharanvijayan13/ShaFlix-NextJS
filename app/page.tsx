import { Suspense } from "react";
import HomeContent from "./components/HomeContent";
import { fetchMovies } from "./lib/api";

export default async function Home() {
  // Default values; you can later extend to use searchParams if needed
  const initialMood = "popular";
  const initialPage = 1;
  const initialSearch = "";
  const { results, total_pages } = await fetchMovies(initialMood, initialPage, initialSearch);

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
