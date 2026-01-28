import { db } from "../db";
import { movies } from "../db/schema";
import { eq } from "drizzle-orm";
import { Movie } from "../types";

/**
 * Ensure movie exists in database cache
 * If not found, insert it
 */
export async function ensureMovieExists(movie: Movie) {
  const existing = await db.query.movies.findFirst({
    where: eq(movies.id, movie.id),
  });

  if (!existing) {
    await db.insert(movies).values({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      runtime: movie.runtime,
    });
  }

  return movie.id;
}

/**
 * Batch ensure multiple movies exist
 */
export async function ensureMoviesExist(movieList: Movie[]) {
  const movieIds = movieList.map(m => m.id);
  
  // Find which movies already exist
  const existing = await db.query.movies.findMany({
    where: (movies, { inArray }) => inArray(movies.id, movieIds),
  });
  
  const existingIds = new Set(existing.map(m => m.id));
  const toInsert = movieList.filter(m => !existingIds.has(m.id));

  // Insert missing movies
  if (toInsert.length > 0) {
    await db.insert(movies).values(
      toInsert.map(movie => ({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
        runtime: movie.runtime,
      }))
    );
  }

  return movieIds;
}
