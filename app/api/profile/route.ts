import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { users, favorites, watched, diaryEntries, customLists } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/profile
 * Get user profile with stats
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.userId),
    });

    if (!user) {
      return createAuthError("User not found", 404);
    }

    // Get stats
    const [favCount] = await db.select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.userId, auth.userId));

    const [watchedCount] = await db.select({ count: sql<number>`count(*)` })
      .from(watched)
      .where(eq(watched.userId, auth.userId));

    const [diaryCount] = await db.select({ count: sql<number>`count(*)` })
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, auth.userId));

    const [listsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(customLists)
      .where(eq(customLists.userId, auth.userId));

    // Calculate hours watched (assuming average 2 hours per movie)
    const hoursWatched = Math.round((watchedCount.count * 2) * 10) / 10;

    return Response.json({
      profile: {
        username: user.username || "Movie Lover",
        handle: user.handle || "@user",
        bio: user.bio || "Passionate about cinema",
        avatarUrl: user.avatarUrl || "",
        email: user.email,
        stats: {
          moviesWatched: watchedCount.count,
          diaryEntries: diaryCount.count,
          favorites: favCount.count,
          lists: listsCount.count,
          hoursWatched,
        },
      },
    });

  } catch (error: any) {
    return createAuthError(error.message || "Failed to fetch profile", 500);
  }
}

/**
 * PATCH /api/profile
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const { username, handle, bio, avatarUrl }: {
      username?: string;
      handle?: string;
      bio?: string;
      avatarUrl?: string;
    } = await request.json();

    await db.update(users)
      .set({
        ...(username !== undefined && { username }),
        ...(handle !== undefined && { handle }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, auth.userId));

    return Response.json({ success: true });

  } catch (error: any) {
    return createAuthError(error.message || "Failed to update profile", 500);
  }
}
