import { pgTable, uuid, varchar, timestamp, integer, text, boolean, primaryKey, real, index } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  firebaseUidIdx: index("users_firebase_uid_idx").on(table.firebaseUid),
  emailIdx: index("users_email_idx").on(table.email),
}));

// Movies table - cache TMDB movie data
export const movies = pgTable("movies", {
  id: integer("id").primaryKey(), // TMDB ID
  title: varchar("title", { length: 500 }).notNull(),
  posterPath: varchar("poster_path", { length: 500 }),
  releaseDate: varchar("release_date", { length: 50 }),
  overview: text("overview"),
  voteAverage: real("vote_average"),
  runtime: integer("runtime"),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});

// Favorites - many-to-many relationship
export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("favorites_user_id_idx").on(table.userId),
  movieIdIdx: index("favorites_movie_id_idx").on(table.movieId),
}));

// Watchlist - many-to-many relationship
export const watchlist = pgTable("watchlist", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("watchlist_user_id_idx").on(table.userId),
  movieIdIdx: index("watchlist_movie_id_idx").on(table.movieId),
}));

// Watched - many-to-many relationship
export const watched = pgTable("watched", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
  userIdIdx: index("watched_user_id_idx").on(table.userId),
  movieIdIdx: index("watched_movie_id_idx").on(table.movieId),
  watchedAtIdx: index("watched_watched_at_idx").on(table.watchedAt),
}));

// Diary entries - detailed watch logs
export const diaryEntries = pgTable("diary_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  watchedDate: varchar("watched_date", { length: 50 }).notNull(),
  rating: real("rating"),
  review: text("review"),
  tags: text("tags").array(),
  rewatch: boolean("rewatch").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("diary_entries_user_id_idx").on(table.userId),
  movieIdIdx: index("diary_entries_movie_id_idx").on(table.movieId),
  watchedDateIdx: index("diary_entries_watched_date_idx").on(table.watchedDate),
}));

// Custom lists
export const customLists = pgTable("custom_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// List movies - many-to-many with ordering
export const listMovies = pgTable("list_movies", {
  listId: uuid("list_id").notNull().references(() => customLists.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.listId, table.movieId] }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  watchlist: many(watchlist),
  watched: many(watched),
  diaryEntries: many(diaryEntries),
  customLists: many(customLists),
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
