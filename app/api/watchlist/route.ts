import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { watchlist } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureMovieExists } from "@/app/lib/movie-cache";
import { Movie } from "@/app/types";

/**
 * GET /api/watchlist
 * Get user's watchlist
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const userWatchlist = await db.query.watchlist.findMany({
      where: eq(watchlist.userId, auth.userId),
      with: {
        movie: true,
      },
      orderBy: (watchlist, { desc }) => [desc(watchlist.createdAt)],
    });

    const movieList = userWatchlist.map(item => ({
      id: item.movie.id,
      title: item.movie.title,
      poster_path: item.movie.posterPath,
      release_date: item.movie.releaseDate,
      overview: item.movie.overview,
      vote_average: item.movie.voteAverage,
      runtime: item.movie.runtime,
    }));

    return Response.json({ watchlist: movieList });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch watchlist";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * POST /api/watchlist
 * Toggle watchlist status for a movie
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { movie, action }: { movie: Movie; action: "add" | "remove" } = await request.json();

    if (action === "add") {
      await ensureMovieExists(movie);

      await db.insert(watchlist)
        .values({
          userId: auth.userId,
          movieId: movie.id,
        })
        .onConflictDoNothing();

      return Response.json({ success: true, action: "added" });

    } else if (action === "remove") {
      await db.delete(watchlist)
        .where(
          and(
            eq(watchlist.userId, auth.userId),
            eq(watchlist.movieId, movie.id)
          )
        );

      return Response.json({ success: true, action: "removed" });
    }

    return createAuthError("Invalid action", 400);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update watchlist";
    return createAuthError(errorMessage, 500);
  }
}
