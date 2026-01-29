import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { users, favorites, watchlist, watched, diaryEntries, customLists, listMovies } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { ensureMoviesExist } from "@/app/lib/movie-cache";
import { initializeUserStats, updateUserStats } from "@/app/lib/user-stats";
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

    console.log("Syncing data for user:", auth.userId);

    // Update user profile if provided
    if (data.profile) {
      try {
        await db.update(users)
          .set({
            username: data.profile.username,
            handle: data.profile.handle,
            bio: data.profile.bio,
            avatarUrl: data.profile.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, auth.userId));
        console.log("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile:", error);
        // Continue with sync even if profile update fails
      }
    }

    // Collect all movies to cache
    const allMovies: Movie[] = [
      ...(data.favorites || []),
      ...(data.watchlist || []),
      ...(data.watched || []),
    ];

    // Collect movie IDs from custom lists
    const listMovieIds = new Set<number>();
    if (data.customLists) {
      for (const list of data.customLists) {
        list.movieIds.forEach(id => listMovieIds.add(id));
      }
    }

    // Ensure all movies exist in cache
    if (allMovies.length > 0) {
      try {
        console.log("Caching", allMovies.length, "movies");
        await ensureMoviesExist(allMovies);
        console.log("Movies cached successfully");
      } catch (error) {
        console.error("Failed to cache movies:", error);
        // Continue with sync even if caching fails
      }
    }

    // Cache movies from custom lists (by ID only)
    if (listMovieIds.size > 0) {
      try {
        console.log("Caching", listMovieIds.size, "movies from custom lists");
        // Fetch movie details from TMDB and cache them
        const movieDetailsPromises = Array.from(listMovieIds).map(async (movieId) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
            );
            if (response.ok) {
              const movieData = await response.json();
              return {
                id: movieData.id,
                title: movieData.title,
                poster_path: movieData.poster_path,
                release_date: movieData.release_date,
                overview: movieData.overview,
                vote_average: movieData.vote_average,
              } as Movie;
            }
          } catch (error) {
            console.error(`Failed to fetch movie ${movieId}:`, error);
          }
          return null;
        });
        
        const movieDetails = (await Promise.all(movieDetailsPromises)).filter(Boolean) as Movie[];
        if (movieDetails.length > 0) {
          await ensureMoviesExist(movieDetails);
        }
        console.log("Custom list movies cached successfully");
      } catch (error) {
        console.error("Failed to cache custom list movies:", error);
        // Continue with sync even if caching fails
      }
    }

    // Sync favorites
    if (data.favorites && data.favorites.length > 0) {
      try {
        await db.insert(favorites)
          .values(data.favorites.map(movie => ({
            userId: auth.userId,
            movieId: movie.id,
          })))
          .onConflictDoNothing();
        console.log("Synced", data.favorites.length, "favorites");
      } catch (error) {
        console.error("Failed to sync favorites:", error);
      }
    }

    // Sync watchlist
    if (data.watchlist && data.watchlist.length > 0) {
      try {
        await db.insert(watchlist)
          .values(data.watchlist.map(movie => ({
            userId: auth.userId,
            movieId: movie.id,
          })))
          .onConflictDoNothing();
        console.log("Synced", data.watchlist.length, "watchlist items");
      } catch (error) {
        console.error("Failed to sync watchlist:", error);
      }
    }

    // Sync watched
    if (data.watched && data.watched.length > 0) {
      try {
        await db.insert(watched)
          .values(data.watched.map(movie => ({
            userId: auth.userId,
            movieId: movie.id,
          })))
          .onConflictDoNothing();
        console.log("Synced", data.watched.length, "watched items");
      } catch (error) {
        console.error("Failed to sync watched:", error);
      }
    }

    // Sync diary entries
    if (data.diaryEntries && data.diaryEntries.length > 0) {
      try {
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
        console.log("Synced", data.diaryEntries.length, "diary entries");
      } catch (error) {
        console.error("Failed to sync diary entries:", error);
      }
    }

    // Sync custom lists
    if (data.customLists && data.customLists.length > 0) {
      try {
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
        console.log("Synced", data.customLists.length, "custom lists");
      } catch (error) {
        console.error("Failed to sync custom lists:", error);
      }
    }

    console.log("Sync completed successfully");
    
    // Initialize and update user stats after sync
    await initializeUserStats(auth.userId);
    await updateUserStats(auth.userId);
    
    return Response.json({ 
      success: true, 
      message: "Data synced successfully" 
    });

  } catch (error) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sync data";
    return createAuthError(errorMessage, 500);
  }
}
