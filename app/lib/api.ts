import { Movie } from "../types";

const API_KEY =
  typeof window === "undefined"
    ? process.env.TMDB_API_KEY
    : process.env.NEXT_PUBLIC_TMDB_API_KEY;

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
  const isStaticExport =
    process.env.NEXT_PHASE === "phase-export" ||
    process.env.NODE_ENV === "production";

  if (isServer && isStaticExport) {
    let url = "";

    if (query && query.trim() !== "") {
      url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}`;
    } else if (mood.toLowerCase() === "popular") {
      url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
    } else if (mood.toLowerCase() === "sad") {
      // For sad movies: drama genre with emotional themes, lower vote count threshold for indie films
      url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
    } else if (mood.toLowerCase() === "disturbing") {
      // For disturbing movies: horror/thriller with psychological elements, lower vote count for arthouse films
      url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27,53&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
    } else {
      const moodGenreMap: Record<string, number> = {
        excited: 28,      // Action
        happy: 35,        // Comedy
        scared: 27,       // Horror
        romantic: 10749,  // Romance
        curious: 878,     // Science Fiction
        nostalgic: 16,    // Animation
        thoughtful: 18,   // Drama
        adventurous: 12,  // Adventure
        mysterious: 9648, // Mystery
        thrilled: 53,     // Thriller
      };

      const genreId = moodGenreMap[mood.toLowerCase()];
      if (!genreId) throw new Error("Invalid mood selected");

      url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch movies from TMDB");

    const data = await res.json();
    return { results: data.results, total_pages: data.total_pages };
  }

  // Client-side or local server-side fallback to internal API route
  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";
  const url = `${baseUrl}/api/movies?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch movies");

  const data = await res.json();
  return { results: data.results, total_pages: data.total_pages };
};

export async function getMovieCredits(movieId: number) {
  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}/credits?language=en-US&api_key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch credits");

    return await res.json();
  } catch (err) {
    console.error("Failed to fetch credits", err);
    return {};
  }
}
