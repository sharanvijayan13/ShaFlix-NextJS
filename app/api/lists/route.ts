import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { customLists, listMovies } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureMovieExists } from "@/app/lib/movie-cache";
import { Movie } from "@/app/types";

/**
 * GET /api/lists
 * Get user's custom lists
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const lists = await db.query.customLists.findMany({
      where: eq(customLists.userId, auth.userId),
      with: {
        listMovies: {
          with: {
            movie: true,
          },
          orderBy: (listMovies, { asc }) => [asc(listMovies.order)],
        },
      },
      orderBy: (customLists, { desc }) => [desc(customLists.createdAt)],
    });

    const formattedLists = lists.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description,
      isPublic: list.isPublic,
      movieIds: list.listMovies.map(lm => lm.movieId),
      movies: list.listMovies.map(lm => ({
        id: lm.movie.id,
        title: lm.movie.title,
        poster_path: lm.movie.posterPath,
        release_date: lm.movie.releaseDate,
        overview: lm.movie.overview,
        vote_average: lm.movie.voteAverage,
        runtime: lm.movie.runtime,
      })),
      createdAt: list.createdAt?.toISOString(),
      updatedAt: list.updatedAt?.toISOString(),
    }));

    return Response.json({ lists: formattedLists });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch lists";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * POST /api/lists
 * Create a new custom list
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { name, description, isPublic }: { 
      name: string; 
      description?: string; 
      isPublic: boolean;
    } = await request.json();

    const [list] = await db.insert(customLists)
      .values({
        userId: auth.userId,
        name,
        description: description || "",
        isPublic,
      })
      .returning();

    return Response.json({ 
      success: true, 
      list: {
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
        movieIds: [],
        createdAt: list.createdAt?.toISOString(),
        updatedAt: list.updatedAt?.toISOString(),
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create list";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * PATCH /api/lists
 * Update a list or add/remove movies
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { 
      listId, 
      name, 
      description, 
      isPublic,
      addMovie,
      removeMovie,
      reorderMovies,
    }: { 
      listId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
      addMovie?: Movie;
      removeMovie?: number;
      reorderMovies?: number[];
    } = await request.json();

    // Update list metadata
    if (name !== undefined || description !== undefined || isPublic !== undefined) {
      await db.update(customLists)
        .set({
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(customLists.id, listId),
            eq(customLists.userId, auth.userId)
          )
        );
    }

    // Add movie to list
    if (addMovie) {
      await ensureMovieExists(addMovie);
      
      const existingMovies = await db.query.listMovies.findMany({
        where: eq(listMovies.listId, listId),
      });

      await db.insert(listMovies)
        .values({
          listId,
          movieId: addMovie.id,
          order: existingMovies.length,
        })
        .onConflictDoNothing();
    }

    // Remove movie from list
    if (removeMovie) {
      await db.delete(listMovies)
        .where(
          and(
            eq(listMovies.listId, listId),
            eq(listMovies.movieId, removeMovie)
          )
        );
    }

    // Reorder movies
    if (reorderMovies) {
      for (let i = 0; i < reorderMovies.length; i++) {
        await db.update(listMovies)
          .set({ order: i })
          .where(
            and(
              eq(listMovies.listId, listId),
              eq(listMovies.movieId, reorderMovies[i])
            )
          );
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update list";
    return createAuthError(errorMessage, 500);
  }
}

/**
 * DELETE /api/lists
 * Delete a custom list
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("id");

    if (!listId) {
      return createAuthError("List ID is required", 400);
    }

    await db.delete(customLists)
      .where(
        and(
          eq(customLists.id, listId),
          eq(customLists.userId, auth.userId)
        )
      );

    return Response.json({ success: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete list";
    return createAuthError(errorMessage, 500);
  }
}
