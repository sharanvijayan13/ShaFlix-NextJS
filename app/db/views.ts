// Drizzle ORM view definitions for Shaflix
// Views provide read-only access to unified/computed data without duplication

import { pgView } from "drizzle-orm/pg-core";
import { uuid, varchar, text, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * user_movie_activity view
 * 
 * Unified view of all user movie activities across:
 * - favorites
 * - watchlist  
 * - watched
 * - diary_entries
 * 
 * Includes human-readable fields for admin/debugging:
 * - User: email, displayName, username, avatarUrl
 * - Movie: title, posterPath, releaseDate
 * - Activity: type, timestamp, diary-specific fields
 * 
 * Usage:
 * ```ts
 * import { db } from './db';
 * import { userMovieActivity } from './db/views';
 * 
 * // Get all activities for a user
 * const activities = await db
 *   .select()
 *   .from(userMovieActivity)
 *   .where(eq(userMovieActivity.userId, userId))
 *   .orderBy(desc(userMovieActivity.activityTimestamp));
 * 
 * // Get recent diary entries across all users
 * const recentDiaries = await db
 *   .select()
 *   .from(userMovieActivity)
 *   .where(eq(userMovieActivity.activityType, 'DIARY'))
 *   .orderBy(desc(userMovieActivity.activityTimestamp))
 *   .limit(50);
 * 
 * // Admin: Find users who favorited a specific movie
 * const fans = await db
 *   .select({
 *     email: userMovieActivity.email,
 *     displayName: userMovieActivity.displayName,
 *     timestamp: userMovieActivity.activityTimestamp
 *   })
 *   .from(userMovieActivity)
 *   .where(
 *     and(
 *       eq(userMovieActivity.movieId, movieId),
 *       eq(userMovieActivity.activityType, 'FAVORITE')
 *     )
 *   );
 * ```
 */
export const userMovieActivity = pgView("user_movie_activity").as((qb) => {
  // Note: Drizzle doesn't fully support UNION ALL views in type-safe way yet
  // This is a placeholder for type definitions
  // The actual view is created via SQL migration (0003_create_user_movie_activity_view.sql)
  
  // For now, we define the shape manually for type safety
  return qb.select({
    userId: uuid("user_id"),
    email: varchar("email", { length: 255 }),
    displayName: varchar("display_name", { length: 255 }),
    username: varchar("username", { length: 100 }),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    movieId: integer("movie_id"),
    movieTitle: varchar("movie_title", { length: 500 }),
    moviePoster: varchar("movie_poster", { length: 500 }),
    movieReleaseDate: varchar("movie_release_date", { length: 50 }),
    activityType: text("activity_type"), // 'FAVORITE' | 'WATCHLIST' | 'WATCHED' | 'DIARY'
    activityTimestamp: timestamp("activity_timestamp"),
    rating: real("rating"), // Only for DIARY
    review: text("review"), // Only for DIARY
    rewatch: boolean("rewatch"), // Only for DIARY
    tags: text("tags").array(), // Only for DIARY
    watchedDate: text("watched_date"), // Only for DIARY
    diaryEntryId: uuid("diary_entry_id"), // Only for DIARY
    listId: uuid("list_id"), // Reserved for future list activity
    listName: text("list_name"), // Reserved for future list activity
  });
});

// Type inference for TypeScript
export type UserMovieActivity = typeof userMovieActivity.$inferSelect;
