import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { watched } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureMovieExists } from "@/app/lib/movie-cache";
import { Movie } from "@/app/types";

/**
 * GET /api/watched
 * Get user's watched movies
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const userWatched = await db.query.watched.findMany({
      where: eq(watched.userId, auth.userId),
      with: {
        movie: true,
      },
      orderBy: (watched, { desc }) => [desc(watched.watchedAt)],
    });

    const movieList = userWatched.map(item => ({
      id: item.movie.id,
      title: item.movie.title,
      poster_path: item.movie.posterPath,
      release_date: item.movie.releaseDate,
      overview: item.movie.overview,
      vote_average: item.movie.voteAverage,
      runtime: item.movie.runtime,
    }));

    return Response.json({ watched: movieList });

  } catch (error: any) {
    return createAuthError(error.message || "Failed to fetch watched movies", 500);
  }
}

/**
 * POST /api/watched
 * Toggle watched status for a movie
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { movie, action }: { movie: Movie; action: "add" | "remove" } = await request.json();

    if (action === "add") {
      await ensureMovieExists(movie);

      await db.insert(watched)
        .values({
          userId: auth.userId,
          movieId: movie.id,
        })
        .onConflictDoNothing();

      return Response.json({ success: true, action: "added" });

    } else if (action === "remove") {
      await db.delete(watched)
        .where(
          and(
            eq(watched.userId, auth.userId),
            eq(watched.movieId, movie.id)
          )
        );

      return Response.json({ success: true, action: "removed" });
    }

    return createAuthError("Invalid action", 400);

  } catch (error: any) {
    return createAuthError(error.message || "Failed to update watched status", 500);
  }
}
