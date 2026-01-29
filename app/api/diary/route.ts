import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { diaryEntries } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureMovieExists, getCachedMovieWithExtendedData } from "@/app/lib/movie-cache";
import { updateUserStats, updateUserActivity } from "@/app/lib/user-stats";
import { Movie } from "@/app/types";

/**
 * GET /api/diary
 * Get user's diary entries with cached director data
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const entries = await db.query.diaryEntries.findMany({
      where: eq(diaryEntries.userId, auth.userId),
      with: {
        movie: true,
      },
      orderBy: (diaryEntries, { desc }) => [desc(diaryEntries.watchedDate)],
    });

    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      movieId: entry.movieId,
      movie: {
        id: entry.movie.id,
        title: entry.movie.title,
        poster_path: entry.movie.posterPath,
        release_date: entry.movie.releaseDate,
        overview: entry.movie.overview,
        vote_average: entry.movie.voteAverage,
        runtime: entry.movie.runtime,
        // Include cached director and cast data
        director_name: entry.movie.directorName,
        primary_cast: entry.movie.primaryCast,
        genres: entry.movie.genres,
      },
      watchedDate: entry.watchedDate,
      rating: entry.rating,
      review: entry.review,
      tags: entry.tags,
      rewatch: entry.rewatch,
      createdAt: entry.createdAt?.toISOString(),
      updatedAt: entry.updatedAt?.toISOString(),
    }));

    return Response.json({ entries: formattedEntries });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch diary entries";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * POST /api/diary
 * Create a new diary entry with extended movie data
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { 
      movie, 
      watchedDate, 
      rating, 
      review, 
      tags, 
      rewatch 
    }: { 
      movie: Movie; 
      watchedDate: string; 
      rating?: number; 
      review?: string; 
      tags: string[]; 
      rewatch: boolean;
    } = await request.json();

    // Ensure movie exists with extended data (director, cast, genres)
    await ensureMovieExists(movie, true);

    // Create diary entry
    const [entry] = await db.insert(diaryEntries)
      .values({
        userId: auth.userId,
        movieId: movie.id,
        watchedDate,
        rating,
        review,
        tags,
        rewatch,
      })
      .returning();

    // Update user activity and stats
    await Promise.all([
      updateUserActivity(auth.userId, 'diary'),
      updateUserStats(auth.userId),
    ]);

    return Response.json({ 
      success: true, 
      entry: {
        id: entry.id,
        movieId: entry.movieId,
        watchedDate: entry.watchedDate,
        rating: entry.rating,
        review: entry.review,
        tags: entry.tags,
        rewatch: entry.rewatch,
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create diary entry";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * PATCH /api/diary
 * Update an existing diary entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { 
      entryId,
      rating, 
      review, 
      tags,
    }: { 
      entryId: string;
      rating?: number; 
      review?: string; 
      tags?: string[]; 
    } = await request.json();

    if (!entryId) {
      return createAuthError("Entry ID is required", 400);
    }

    // Update diary entry
    await db.update(diaryEntries)
      .set({
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(diaryEntries.id, entryId),
          eq(diaryEntries.userId, auth.userId)
        )
      );

    // Update user stats (in case rating changed)
    await updateUserStats(auth.userId);

    return Response.json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update diary entry";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * DELETE /api/diary
 * Delete a diary entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("id");

    if (!entryId) {
      return createAuthError("Entry ID is required", 400);
    }

    await db.delete(diaryEntries)
      .where(
        and(
          eq(diaryEntries.id, entryId),
          eq(diaryEntries.userId, auth.userId)
        )
      );

    // Update user stats
    await updateUserStats(auth.userId);

    return Response.json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete diary entry";
    return createAuthError(errorMessage, 500);
  }
}
