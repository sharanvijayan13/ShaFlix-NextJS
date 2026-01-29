import { NextRequest } from "next/server";
import { authenticateRequest, createAuthError } from "@/app/lib/auth-middleware";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getUserStats, updateUserStats } from "@/app/lib/user-stats";

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

    // Get stats from denormalized table (much faster than COUNT queries)
    const stats = await getUserStats(auth.userId);

    // Calculate hours watched from total runtime
    const hoursWatched = stats ? Math.round((stats.totalRuntimeMinutes / 60) * 10) / 10 : 0;

    return Response.json({
      profile: {
        username: user.username || "Movie Lover",
        handle: user.handle || "@user",
        bio: user.bio || "Passionate about cinema",
        avatarUrl: user.avatarUrl || "",
        email: user.email,
        stats: {
          moviesWatched: stats?.moviesWatched || 0,
          diaryEntries: stats?.diaryEntriesCount || 0,
          favorites: stats?.favoritesCount || 0,
          lists: stats?.listsCount || 0,
          hoursWatched,
          avgRating: stats?.avgRating || null,
        },
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    return createAuthError(errorMessage, 500);
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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
    return createAuthError(errorMessage, 500);
  }
}
