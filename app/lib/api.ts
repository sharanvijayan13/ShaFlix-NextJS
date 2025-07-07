import { Movie } from "../types";

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

export const fetchMovies = async (
  mood: string,
  page: number = 1,
  query?: string
): Promise<{ results: Movie[]; total_pages: number }> => {
  
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) throw new Error("Missing API Key");

  let url = "";
  
  if (query && query.trim() !== "") {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
  } else if (mood.toLowerCase() === "popular") {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
  } else {
    const genreId = moodGenreMap[mood.toLowerCase()];
    if (!genreId) throw new Error("Invalid mood selected");
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`;
  }

  console.log("Final API URL:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch movies");

  const data = await res.json();
  console.log("API Response Data:", data);
  
  return { results: data.results, total_pages: data.total_pages };
};
