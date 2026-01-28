import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { users, favorites, watchlist, watched, diaryEntries, customLists, listMovies } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { ensureMoviesExist } from "@/app/lib/movie-cache";
import { Movie, DiaryEntry, CustomList } from "@/app/types";

interface SyncData {
  favorites?: Movie[];
  watchlist?: Movie[];
  watched?: Movie[];
  diaryEntries?: DiaryEntry[];
  customLists?: CustomList[];
  profile?: {
    username?: string;
    handle?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

/**
 * POST /api/auth/sync-user
 * Sync localStorage data to database on first login
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const data: SyncData = await request.json();

    // Update user profile if provided
    if (data.profile) {
      await db.update(users)
        .set({
          username: data.profile.username,
          handle: data.profile.handle,
          bio: data.profile.bio,
          avatarUrl: data.profile.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, auth.userId));
    }

    // Collect all movies to cache
    const allMovies: Movie[] = [
      ...(data.favorites || []),
      ...(data.watchlist || []),
      ...(data.watched || []),
    ];

    // Ensure all movies exist in cache
    if (allMovies.length > 0) {
      await ensureMoviesExist(allMovies);
    }

    // Sync favorites
    if (data.favorites && data.favorites.length > 0) {
      await db.insert(favorites)
        .values(data.favorites.map(movie => ({
          userId: auth.userId,
          movieId: movie.id,
        })))
        .onConflictDoNothing();
    }

    // Sync watchlist
    if (data.watchlist && data.watchlist.length > 0) {
      await db.insert(watchlist)
        .values(data.watchlist.map(movie => ({
          userId: auth.userId,
          movieId: movie.id,
        })))
        .onConflictDoNothing();
    }

    // Sync watched
    if (data.watched && data.watched.length > 0) {
      await db.insert(watched)
        .values(data.watched.map(movie => ({
          userId: auth.userId,
          movieId: movie.id,
        })))
        .onConflictDoNothing();
    }

    // Sync diary entries
    if (data.diaryEntries && data.diaryEntries.length > 0) {
      await db.insert(diaryEntries)
        .values(data.diaryEntries.map(entry => ({
          userId: auth.userId,
          movieId: entry.movieId,
          watchedDate: entry.watchedDate,
          rating: entry.rating,
          review: entry.review,
          tags: entry.tags,
          rewatch: entry.rewatch,
        })))
        .onConflictDoNothing();
    }

    // Sync custom lists
    if (data.customLists && data.customLists.length > 0) {
      for (const list of data.customLists) {
        const [createdList] = await db.insert(customLists)
          .values({
            userId: auth.userId,
            name: list.name,
            description: list.description,
            isPublic: list.isPublic,
          })
          .returning();

        // Add movies to list
        if (list.movieIds.length > 0) {
          await db.insert(listMovies)
            .values(list.movieIds.map((movieId, index) => ({
              listId: createdList.id,
              movieId,
              order: index,
            })))
            .onConflictDoNothing();
        }
      }
    }

    return Response.json({ 
      success: true, 
      message: "Data synced successfully" 
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return createAuthError(error.message || "Failed to sync data", 500);
  }
}
