import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const mood = searchParams.get("mood") || "popular";
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";

  let url = "";

  if (query.trim()) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
  } else if (mood.toLowerCase() === "popular") {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
  } else {
    const genreId = moodGenreMap[mood.toLowerCase()];
    if (!genreId) return NextResponse.json({ error: "Invalid mood selected" }, { status: 400 });
    
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`;
  }

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });

  const data = await res.json();
  return NextResponse.json(data);
}