import { NextRequest } from "next/server";
import { auth } from "./auth";

/**
 * Get the current authenticated user from the request
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session?.user ?? null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Require authentication for a route
 * Throws an error if user is not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Check if a user can access a member's data
 * Members can only access their own data unless they are admins
 */
export function canAccessMember(userId: string, memberId: string, userRole?: string): boolean {
  // Admins can access all member data
  if (userRole === "admin") {
    return true;
  }

  // Users can only access their own member data
  return userId === memberId;
}

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    { error: message },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}
