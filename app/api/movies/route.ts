import { NextRequest, NextResponse } from "next/server";

const moodGenreMap: Record<string, number> = {
  excited: 28,      
  happy: 35,        
  scared: 27,       
  romantic: 10749,  
  curious: 878,     
  nostalgic: 16,    
  thoughtful: 18,   
  adventurous: 12,  
  mysterious: 9648, 
  thrilled: 53,     
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
  } else if (mood.toLowerCase() === "sad") {
  
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
  } else if (mood.toLowerCase() === "disturbing") {
    
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27,53&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
  } else {
    const genreId = moodGenreMap[mood.toLowerCase()];
    if (!genreId) return NextResponse.json({ error: "Invalid mood selected" }, { status: 400 });
    
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch movies", details: errorData },
        { status: 500 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Network error while fetching movies", details: String(err) },
      { status: 500 }
    );
  }
}