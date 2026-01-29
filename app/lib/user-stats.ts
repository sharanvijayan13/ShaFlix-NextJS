import { db } from "../db";
import { userStats, users, favorites, watched, diaryEntries, customLists, movies } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Initialize user stats for a new user
 */
export async function initializeUserStats(userId: string) {
  await db.insert(userStats)
    .values({
      userId,
      moviesWatched: 0,
      totalRuntimeMinutes: 0,
      avgRating: null,
      diaryEntriesCount: 0,
      favoritesCount: 0,
      listsCount: 0,
    })
    .onConflictDoNothing();
}

/**
 * Update user stats after adding/removing content
 */
export async function updateUserStats(userId: string) {
  // Get all counts and calculations in a single query
  const [stats] = await db.select({
    favoritesCount: sql<number>`count(distinct ${favorites.movieId})`,
    watchedCount: sql<number>`count(distinct ${watched.movieId})`,
    diaryEntriesCount: sql<number>`count(distinct ${diaryEntries.id})`,
    listsCount: sql<number>`count(distinct ${customLists.id})`,
    totalRuntime: sql<number>`coalesce(sum(distinct ${movies.runtime}), 0)`,
    avgRating: sql<number>`avg(${diaryEntries.rating})`,
  })
  .from(users)
  .leftJoin(favorites, eq(users.id, favorites.userId))
  .leftJoin(watched, and(eq(users.id, watched.userId), eq(watched.movieId, movies.id)))
  .leftJoin(movies, eq(watched.movieId, movies.id))
  .leftJoin(diaryEntries, eq(users.id, diaryEntries.userId))
  .leftJoin(customLists, eq(users.id, customLists.userId))
  .where(eq(users.id, userId))
  .groupBy(users.id);

  // Update user stats
  await db.insert(userStats)
    .values({
      userId,
      moviesWatched: stats.watchedCount,
      totalRuntimeMinutes: stats.totalRuntime,
      avgRating: stats.avgRating,
      diaryEntriesCount: stats.diaryEntriesCount,
      favoritesCount: stats.favoritesCount,
      listsCount: stats.listsCount,
      lastUpdatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userStats.userId,
      set: {
        moviesWatched: stats.watchedCount,
        totalRuntimeMinutes: stats.totalRuntime,
        avgRating: stats.avgRating,
        diaryEntriesCount: stats.diaryEntriesCount,
        favoritesCount: stats.favoritesCount,
        listsCount: stats.listsCount,
        lastUpdatedAt: new Date(),
      },
    });
}

/**
 * Get user stats (from denormalized table for performance)
 */
export async function getUserStats(userId: string) {
  const stats = await db.query.userStats.findFirst({
    where: eq(userStats.userId, userId),
  });

  if (!stats) {
    // Initialize stats if they don't exist
    await initializeUserStats(userId);
    await updateUserStats(userId);
    
    return await db.query.userStats.findFirst({
      where: eq(userStats.userId, userId),
    });
  }

  return stats;
}

/**
 * Update activity timestamps in users table
 */
export async function updateUserActivity(userId: string, activity: 'diary' | 'list') {
  const updateData: any = {};
  
  if (activity === 'diary') {
    updateData.lastDiaryEntryAt = new Date();
  } else if (activity === 'list') {
    updateData.lastListUpdateAt = new Date();
  }
  
  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Increment list engagement metrics
 */
export async function incrementListViews(listId: string) {
  await db.update(customLists)
    .set({
      viewCount: sql`${customLists.viewCount} + 1`,
    })
    .where(eq(customLists.id, listId));
}

export async function incrementListLikes(listId: string) {
  await db.update(customLists)
    .set({
      likeCount: sql`${customLists.likeCount} + 1`,
    })
    .where(eq(customLists.id, listId));
}

export async function decrementListLikes(listId: string) {
  await db.update(customLists)
    .set({
      likeCount: sql`greatest(0, ${customLists.likeCount} - 1)`,
    })
    .where(eq(customLists.id, listId));
}