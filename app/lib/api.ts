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

export async function getMovieVideos(movieId: number) {
  try {
    console.log(`[getMovieVideos] Fetching trailer for movie ID: ${movieId}`);
    
    // Get movie details to find original language and title
    const movieDetailsUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
    const movieRes = await fetch(movieDetailsUrl);
    
    if (!movieRes.ok) {
      console.error("[getMovieVideos] Failed to fetch movie details");
      return null;
    }

    const movieData = await movieRes.json();
    const movieTitle = movieData.original_title || movieData.title; // Use original title
    const releaseYear = movieData.release_date?.split('-')[0];
    const originalLanguage = movieData.original_language; // e.g., 'ta' for Tamil, 'hi' for Hindi
    
    console.log(`[getMovieVideos] Movie: ${movieTitle}, Year: ${releaseYear}, Language: ${originalLanguage}`);
    
    // Search YouTube directly with original language preference
    const trailer = await searchYouTubeTrailer(movieTitle, releaseYear, originalLanguage);
    console.log(`[getMovieVideos] YouTube search result:`, trailer ? "Found" : "Not found");

    return trailer;
  } catch (err) {
    console.error("[getMovieVideos] Error:", err);
    return null;
  }
}

async function searchYouTubeTrailer(movieTitle: string, releaseYear?: string, originalLanguage?: string) {
  try {
    const YOUTUBE_API_KEY = 
      typeof window === "undefined"
        ? process.env.YOUTUBE_API_KEY
        : process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    console.log(`[searchYouTubeTrailer] YouTube API key present:`, !!YOUTUBE_API_KEY);

    if (!YOUTUBE_API_KEY) {
      console.warn("[searchYouTubeTrailer] YouTube API key not configured");
      return null;
    }

    // Build search query with original title and language hint
    const searchQuery = releaseYear 
      ? `${movieTitle} ${releaseYear} official trailer`
      : `${movieTitle} official trailer`;

    console.log(`[searchYouTubeTrailer] Search query: "${searchQuery}"`);

    // Add relevanceLanguage parameter to prefer videos in original language
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`;
    
    if (originalLanguage) {
      url += `&relevanceLanguage=${originalLanguage}`;
      console.log(`[searchYouTubeTrailer] Filtering for language: ${originalLanguage}`);
    }
    
    const res = await fetch(url);
    
    console.log(`[searchYouTubeTrailer] YouTube API response status:`, res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[searchYouTubeTrailer] YouTube API error:", res.status, errorText);
      return null;
    }

    const data = await res.json();
    
    console.log(`[searchYouTubeTrailer] YouTube results count:`, data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      // Find the first video that looks like an official trailer
      const trailer = data.items.find((item: any) => {
        const title = item.snippet.title.toLowerCase();
        return title.includes('trailer') || title.includes('official');
      }) || data.items[0]; // Fallback to first result
      
      console.log(`[searchYouTubeTrailer] Found video:`, trailer.snippet.title);
      return {
        key: trailer.id.videoId,
        site: "YouTube",
        type: "Trailer",
        name: trailer.snippet.title,
      };
    }

    return null;
  } catch (err) {
    console.error("[searchYouTubeTrailer] Error:", err);
    return null;
  }
}
