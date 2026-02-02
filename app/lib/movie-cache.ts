import { db } from "../db";
import { movies } from "../db/schema";
import { eq } from "drizzle-orm";
import { Movie } from "../types";

/**
 * Fetch director and cast data from TMDB
 */
async function fetchMovieCredits(movieId: number) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`
    );

    if (!response.ok) return null;

    const credits = await response.json();
    const director = credits.crew?.find((person: any) => person.job === "Director");
    const primaryCast = credits.cast?.slice(0, 5).map((actor: any) => actor.name) || [];

    return {
      directorName: director?.name || null,
      primaryCast,
    };
  } catch (error) {
    console.error(`Failed to fetch credits for movie ${movieId}:`, error);
    return null;
  }
}

/**
 * Fetch movie details including genres from TMDB
 */
async function fetchMovieDetails(movieId: number) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
    );

    if (!response.ok) return null;

    const details = await response.json();
    const genres = details.genres?.map((genre: any) => genre.name) || [];

    return { genres };
  } catch (error) {
    console.error(`Failed to fetch details for movie ${movieId}:`, error);
    return null;
  }
}

/**
 * Ensure movie exists in database cache with enhanced data
 * If not found, insert it with director, cast, and genre data
 */
export async function ensureMovieExists(movie: Movie, fetchExtendedData = false) {
  const existing = await db.query.movies.findFirst({
    where: eq(movies.id, movie.id),
  });

  if (!existing) {
    let extendedData = {};

    // Fetch extended data if requested (for diary entries, etc.)
    if (fetchExtendedData) {
      const [credits, details] = await Promise.all([
        fetchMovieCredits(movie.id),
        fetchMovieDetails(movie.id),
      ]);

      if (credits) {
        extendedData = {
          directorName: credits.directorName,
          primaryCast: credits.primaryCast,
        };
      }

      if (details) {
        extendedData = {
          ...extendedData,
          genres: details.genres,
        };
      }
    }

    await db.insert(movies).values({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      runtime: movie.runtime,
      ...extendedData,
    });
  } else if (fetchExtendedData && !existing.directorName) {
    // Update existing movie with extended data if missing
    const [credits, details] = await Promise.all([
      fetchMovieCredits(movie.id),
      fetchMovieDetails(movie.id),
    ]);

    const updateData: any = { lastUpdatedAt: new Date() };

    if (credits) {
      updateData.directorName = credits.directorName;
      updateData.primaryCast = credits.primaryCast;
    }

    if (details) {
      updateData.genres = details.genres;
    }

    await db.update(movies)
      .set(updateData)
      .where(eq(movies.id, movie.id));
  }

  return movie.id;
}

/**
 * Batch ensure multiple movies exist with optional extended data
 */
export async function ensureMoviesExist(movieList: Movie[], fetchExtendedData = false) {
  const movieIds = movieList.map(m => m.id);

  // Find which movies already exist
  const existing = await db.query.movies.findMany({
    where: (movies, { inArray }) => inArray(movies.id, movieIds),
  });

  const existingIds = new Set(existing.map(m => m.id));
  const toInsert = movieList.filter(m => !existingIds.has(m.id));
  const toUpdate = existing.filter(m => fetchExtendedData && !m.directorName);

  // Insert missing movies
  if (toInsert.length > 0) {
    const insertPromises = toInsert.map(async (movie) => {
      let extendedData = {};

      if (fetchExtendedData) {
        const [credits, details] = await Promise.all([
          fetchMovieCredits(movie.id),
          fetchMovieDetails(movie.id),
        ]);

        if (credits) {
          extendedData = {
            directorName: credits.directorName,
            primaryCast: credits.primaryCast,
          };
        }

        if (details) {
          extendedData = {
            ...extendedData,
            genres: details.genres,
          };
        }
      }

      return {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
        runtime: movie.runtime,
        ...extendedData,
      };
    });

    const moviesWithData = await Promise.all(insertPromises);
    await db.insert(movies).values(moviesWithData);
  }

  // Update existing movies with missing extended data
  if (toUpdate.length > 0) {
    const updatePromises = toUpdate.map(async (existingMovie) => {
      const [credits, details] = await Promise.all([
        fetchMovieCredits(existingMovie.id),
        fetchMovieDetails(existingMovie.id),
      ]);

      const updateData: any = { lastUpdatedAt: new Date() };

      if (credits) {
        updateData.directorName = credits.directorName;
        updateData.primaryCast = credits.primaryCast;
      }

      if (details) {
        updateData.genres = details.genres;
      }

      return db.update(movies)
        .set(updateData)
        .where(eq(movies.id, existingMovie.id));
    });

    await Promise.all(updatePromises);
  }
}

/**
 * Get cached movie with extended data, fetch if missing
 */
export async function getCachedMovieWithExtendedData(movieId: number) {
  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, movieId),
  });

  if (!movie) {
    throw new Error(`Movie ${movieId} not found in cache`);
  }

  // If extended data is missing, fetch and update
  if (!movie.directorName) {
    const [credits, details] = await Promise.all([
      fetchMovieCredits(movieId),
      fetchMovieDetails(movieId),
    ]);

    const updateData: any = { lastUpdatedAt: new Date() };

    if (credits) {
      updateData.directorName = credits.directorName;
      updateData.primaryCast = credits.primaryCast;
    }

    if (details) {
      updateData.genres = details.genres;
    }

    await db.update(movies)
      .set(updateData)
      .where(eq(movies.id, movieId));

    return { ...movie, ...updateData };
  }

  return movie;
}
