import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const mood = searchParams.get("mood") || "popular";
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";

  let url = "";

  if (query.trim()) {
    // Search movies by query
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&page=${page}`;
  } else if (mood.toLowerCase() === "popular") {
    // Popular movies
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
  } else if (mood.toLowerCase() === "sad") {
    // Sad = drama/emotional
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
  } else if (mood.toLowerCase() === "disturbing") {
    // Disturbing = horror/thriller/psychological
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27,53&sort_by=vote_average.desc&vote_count.gte=20&with_original_language=en&page=${page}`;
  } else {
    // Genre-mapped moods
    const genreId = moodGenreMap[mood.toLowerCase()];
    if (!genreId) {
      return NextResponse.json({ error: "Invalid mood selected" }, { status: 400 });
    }

    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&with_original_language=en&page=${page}`;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // cache for 60s
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch movies", details: errorText },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err) },
      { status: 500 }
    );
  }
}
