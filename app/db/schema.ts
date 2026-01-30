import { pgTable, uuid, varchar, timestamp, integer, text, boolean, primaryKey, real, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - stores Firebase authenticated users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: varchar("firebase_uid", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }), // Full name from Firebase
  username: varchar("username", { length: 100 }),
  handle: varchar("handle", { length: 100 }),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 500 }), // Profile picture URL
  // Activity tracking for better user engagement insights
  lastDiaryEntryAt: timestamp("last_diary_entry_at"),
  lastListUpdateAt: timestamp("last_list_update_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  firebaseUidIdx: index("users_firebase_uid_idx").on(table.firebaseUid),
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

// Enhanced movies table - cache TMDB movie data with performance optimizations
export const movies = pgTable("movies", {
  id: integer("id").primaryKey(), // TMDB ID
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: varchar("poster_path", { length: 500 }),
  releaseDate: varchar("release_date", { length: 50 }),
  overview: text("overview"),
  voteAverage: real("vote_average"),
  runtime: integer("runtime"),
  // Cache director to eliminate API calls in diary page
  directorName: varchar("director_name", { length: 255 }),
  // Cache primary cast for better performance
  primaryCast: text("primary_cast").array(),
  // Cache genres for filtering capabilities
  genres: text("genres").array(),
  // Enhanced cache management
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("movies_title_idx").on(table.title),
  releaseDateIdx: index("movies_release_date_idx").on(table.releaseDate),
  voteAverageIdx: index("movies_vote_average_idx").on(table.voteAverage),
}));

// User stats table - denormalized for performance
export const userStats = pgTable("user_stats", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  moviesWatched: integer("movies_watched").default(0).notNull(),
  totalRuntimeMinutes: integer("total_runtime_minutes").default(0).notNull(),
  avgRating: real("avg_rating"),
  diaryEntriesCount: integer("diary_entries_count").default(0).notNull(),
  favoritesCount: integer("favorites_count").default(0).notNull(),
  listsCount: integer("lists_count").default(0).notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

// Favorites - many-to-many relationship with enhanced indexing
export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("favorites_user_id_idx").on(table.userId),
  movieIdIdx: index("favorites_movie_id_idx").on(table.movieId),
  userCreatedAtIdx: index("favorites_user_created_at_idx").on(table.userId, table.createdAt),
}));

// Watchlist - many-to-many relationship with enhanced indexing
export const watchlist = pgTable("watchlist", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("watchlist_user_id_idx").on(table.userId),
  movieIdIdx: index("watchlist_movie_id_idx").on(table.movieId),
  userCreatedAtIdx: index("watchlist_user_created_at_idx").on(table.userId, table.createdAt),
}));

// Watched - many-to-many relationship with enhanced indexing
export const watched = pgTable("watched", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("watched_user_id_idx").on(table.userId),
  movieIdIdx: index("watched_movie_id_idx").on(table.movieId),
  watchedAtIdx: index("watched_watched_at_idx").on(table.watchedAt),
  userWatchedAtIdx: index("watched_user_watched_at_idx").on(table.userId, table.watchedAt),
}));

// Enhanced diary entries - detailed watch logs with better constraints
export const diaryEntries = pgTable("diary_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  watchedDate: varchar("watched_date", { length: 50 }).notNull(),
  rating: real("rating"), // 0.5 to 5.0 stars
  review: text("review"),
  tags: text("tags").array(),
  rewatch: boolean("rewatch").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("diary_entries_user_id_idx").on(table.userId),
  movieIdIdx: index("diary_entries_movie_id_idx").on(table.movieId),
  watchedDateIdx: index("diary_entries_watched_date_idx").on(table.watchedDate),
  userWatchedDateIdx: index("diary_entries_user_watched_date_idx").on(table.userId, table.watchedDate),
  ratingIdx: index("diary_entries_rating_idx").on(table.rating),
  // Prevent duplicate diary entries for same movie on same date
  uniqueEntry: unique("diary_entries_unique_entry").on(table.userId, table.movieId, table.watchedDate),
}));

// Enhanced custom lists with engagement metrics
export const customLists = pgTable("custom_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  // Engagement metrics for public lists
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("custom_lists_user_id_idx").on(table.userId),
  publicIdx: index("custom_lists_public_idx").on(table.isPublic),
  nameIdx: index("custom_lists_name_idx").on(table.name),
  // Index for discovering popular public lists
  publicPopularIdx: index("custom_lists_public_popular_idx").on(table.isPublic, table.likeCount, table.viewCount),
}));

// Enhanced list movies - many-to-many with ordering and better indexing
export const listMovies = pgTable("list_movies", {
  listId: uuid("list_id").notNull().references(() => customLists.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.listId, table.movieId] }),
  listOrderIdx: index("list_movies_list_order_idx").on(table.listId, table.order),
  movieIdIdx: index("list_movies_movie_id_idx").on(table.movieId),
}));

// Enhanced relations with new tables
export const usersRelations = relations(users, ({ many, one }) => ({
  favorites: many(favorites),
  watchlist: many(watchlist),
  watched: many(watched),
  diaryEntries: many(diaryEntries),
  customLists: many(customLists),
  stats: one(userStats),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.userId], references: [users.id] }),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  favorites: many(favorites),
  watchlist: many(watchlist),
  watched: many(watched),
  diaryEntries: many(diaryEntries),
  listMovies: many(listMovies),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  movie: one(movies, { fields: [favorites.movieId], references: [movies.id] }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, { fields: [watchlist.userId], references: [users.id] }),
  movie: one(movies, { fields: [watchlist.movieId], references: [movies.id] }),
}));

export const watchedRelations = relations(watched, ({ one }) => ({
  user: one(users, { fields: [watched.userId], references: [users.id] }),
  movie: one(movies, { fields: [watched.movieId], references: [movies.id] }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, { fields: [diaryEntries.userId], references: [users.id] }),
  movie: one(movies, { fields: [diaryEntries.movieId], references: [movies.id] }),
}));

export const customListsRelations = relations(customLists, ({ one, many }) => ({
  user: one(users, { fields: [customLists.userId], references: [users.id] }),
  listMovies: many(listMovies),
}));

export const listMoviesRelations = relations(listMovies, ({ one }) => ({
  list: one(customLists, { fields: [listMovies.listId], references: [customLists.id] }),
  movie: one(movies, { fields: [listMovies.movieId], references: [movies.id] }),
}));
