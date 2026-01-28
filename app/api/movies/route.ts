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

const MOCK_MOVIES = [
  {
    id: 1,
    title: "Mock Movie: Inception",
    poster_path: null,
    release_date: "2010-07-16",
    overview: "This is a mock movie because the TMDB API is unreachable from your network. A thief who steals corporate secrets through the use of dream-sharing technology...",
    vote_average: 8.8,
    genre_ids: [28, 878, 12],
  },
  {
    id: 2,
    title: "Mock Movie: Interstellar",
    poster_path: null,
    release_date: "2014-11-07",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole...",
    vote_average: 8.6,
    genre_ids: [12, 18, 878],
  },
  {
    id: 3,
    title: "Mock Movie: The Dark Knight",
    poster_path: null,
    release_date: "2008-07-18",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
    vote_average: 9.0,
    genre_ids: [18, 28, 80, 53],
  },
  {
    id: 4,
    title: "Mock Movie: Pulp Fiction",
    poster_path: null,
    release_date: "1994-10-14",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine...",
    vote_average: 8.9,
    genre_ids: [53, 80],
  },
  {
    id: 5,
    title: "Mock Movie: Fight Club",
    poster_path: null,
    release_date: "1999-10-15",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club...",
    vote_average: 8.4,
    genre_ids: [18],
  }
];

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
    // Sad = drama/emotional - high-rated dramas
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=7.0&page=${page}`;
  } else if (mood.toLowerCase() === "disturbing") {
    // Disturbing = horror - sort by vote_count to get most discussed/famous horror films (includes controversial)
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27&sort_by=vote_count.desc&vote_count.gte=50&vote_average.gte=5.0&page=${page}`;
  } else if (mood.toLowerCase() === "scared") {
    // Scared = horror - popular scary movies
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27&sort_by=popularity.desc&vote_count.gte=300&vote_average.gte=6.0&page=${page}`;
  } else if (mood.toLowerCase() === "thrilled") {
    // Thrilled = thriller - high-rated suspenseful movies
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=53&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=6.5&page=${page}`;
  } else if (mood.toLowerCase() === "thoughtful") {
    // Thoughtful = drama - intellectual/thought-provoking
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=300&vote_average.gte=7.5&page=${page}`;
  } else {
    // Genre-mapped moods - balanced popularity and quality
    const genreId = moodGenreMap[mood.toLowerCase()];
    if (!genreId) {
      return NextResponse.json({ error: "Invalid mood selected" }, { status: 400 });
    }

    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=200&vote_average.gte=6.0&page=${page}`;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // cache for 60s
    if (!res.ok) {
      console.error("TMDB error, falling back to mock data");
      return NextResponse.json({
        results: MOCK_MOVIES,
        total_pages: 1
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDB fetch exception, falling back to mock data", err);
    return NextResponse.json({
      results: MOCK_MOVIES,
      total_pages: 1
    });
  }
}
