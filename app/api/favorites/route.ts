import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { favorites, movies } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureMovieExists } from "@/app/lib/movie-cache";
import { Movie } from "@/app/types";

/**
 * GET /api/favorites
 * Get user's favorite movies with user information
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const userFavorites = await db.query.favorites.findMany({
      where: eq(favorites.userId, auth.userId),
      with: {
        movie: true,
        user: {
          columns: {
            id: true,
            email: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
    });

    const movieList = userFavorites.map(fav => ({
      id: fav.movie.id,
      title: fav.movie.title,
      poster_path: fav.movie.posterPath,
      release_date: fav.movie.releaseDate,
      overview: fav.movie.overview,
      vote_average: fav.movie.voteAverage,
      runtime: fav.movie.runtime,
      addedAt: fav.createdAt,
      user: {
        email: fav.user.email,
        displayName: fav.user.displayName,
        username: fav.user.username,
        avatarUrl: fav.user.avatarUrl,
      },
    }));

    return Response.json({ favorites: movieList });

  } catch (error: any) {
    return createAuthError(error.message || "Failed to fetch favorites", 500);
  }
}

/**
 * POST /api/favorites
 * Toggle favorite status for a movie
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { movie, action }: { movie: Movie; action: "add" | "remove" } = await request.json();

    if (action === "add") {
      // Ensure movie exists in cache
      await ensureMovieExists(movie);

      // Add to favorites
      await db.insert(favorites)
        .values({
          userId: auth.userId,
          movieId: movie.id,
        })
        .onConflictDoNothing();

      return Response.json({ success: true, action: "added" });

    } else if (action === "remove") {
      // Remove from favorites
      await db.delete(favorites)
        .where(
          and(
            eq(favorites.userId, auth.userId),
            eq(favorites.movieId, movie.id)
          )
        );

      return Response.json({ success: true, action: "removed" });
    }

    return createAuthError("Invalid action", 400);

  } catch (error: any) {
    return createAuthError(error.message || "Failed to update favorites", 500);
  }
}
