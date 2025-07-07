import { Movie } from "../types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const fetchMovies = async (
  mood: string,
  page: number = 1,
  query?: string
): Promise<{ results: Movie[]; total_pages: number }> => {
  const params = new URLSearchParams({
    mood,
    page: page.toString(),
  });

  if (query && query.trim() !== "") {
    params.set("query", query);
  }

  const isServer = typeof window === "undefined";
  const isStaticExport = process.env.NEXT_PHASE === "phase-export" || process.env.NODE_ENV === "production";

  // If on server and during build/static export, fetch directly from TMDB
  if (isServer && isStaticExport) {
    let url = "";
    if (query && query.trim() !== "") {
      url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else if (mood.toLowerCase() === "popular") {
      url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    } else {
      // Map mood to genre
      const moodGenreMap: Record<string, number> = {
        action: 28,
        comedy: 35,
        horror: 27,
        romantic: 10749,
        scifi: 878,
        animation: 16,
        drama: 18,
        crime: 80,
        mystery: 9648,
        thriller: 53,
      };
      const genreId = moodGenreMap[mood.toLowerCase()];
      if (!genreId) throw new Error("Invalid mood selected");
      url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch movies from TMDB");
    const data = await res.json();
    return { results: data.results, total_pages: data.total_pages };
  }

  // Otherwise, use internal API route
  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";
  const url = `${baseUrl}/api/movies?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch movies");

  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
};
