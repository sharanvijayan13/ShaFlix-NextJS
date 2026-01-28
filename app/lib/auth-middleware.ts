import { NextRequest } from "next/server";
import { verifyIdToken } from "./firebase-admin";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  firebaseUid: string;
  email: string;
}

/**
 * Middleware to verify Firebase token and resolve user from database
 * Returns user data or throws error if authentication fails
 */
export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.substring(7);
  
  // Verify Firebase token
  const decodedToken = await verifyIdToken(token);
  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email || "";
  const displayName = decodedToken.name || null;
  const avatarUrl = decodedToken.picture || null;

  // Find or create user in database
  let user = await db.query.users.findFirst({
    where: eq(users.firebaseUid, firebaseUid),
  });

  // Auto-create user if doesn't exist (first login)
  if (!user) {
    const [newUser] = await db.insert(users).values({
      firebaseUid,
      email,
      displayName,
      username: displayName || email.split("@")[0],
      handle: `@${email.split("@")[0]}`,
      avatarUrl,
    }).returning();
    user = newUser;
  } else if (!user.displayName || !user.avatarUrl) {
    // Update existing user with displayName/avatarUrl if missing
    const [updatedUser] = await db.update(users)
      .set({
        displayName: displayName || user.displayName,
        avatarUrl: avatarUrl || user.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    user = updatedUser;
  }

  return {
    userId: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

/**
 * Helper to create authenticated API responses
 */
export function createAuthError(message: string, status: number = 401) {
  return Response.json({ error: message }, { status });
}
