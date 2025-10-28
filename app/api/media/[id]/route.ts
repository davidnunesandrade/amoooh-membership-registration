import { NextRequest } from "next/server";
import { db } from "@/db";
import { displayMedium } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, updateDisplayMediumSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

/**
 * GET /api/media/[id]
 * Get a specific display medium by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    const medium = await db
      .select()
      .from(displayMedium)
      .where(eq(displayMedium.id, id))
      .limit(1);

    if (medium.length === 0) {
      return errorResponse("Media not found", 404);
    }

    return successResponse(medium[0]);
  } catch (error) {
    console.error("Error fetching media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch media", 500);
  }
}

/**
 * PUT /api/media/[id]
 * Update a display medium
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    const validation = await validateRequest(request, updateDisplayMediumSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const updated = await db
      .update(displayMedium)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(displayMedium.id, id))
      .returning();

    if (updated.length === 0) {
      return errorResponse("Media not found", 404);
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to update media", 500);
  }
}

/**
 * DELETE /api/media/[id]
 * Delete a display medium
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    const deleted = await db
      .delete(displayMedium)
      .where(eq(displayMedium.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse("Media not found", 404);
    }

    return successResponse({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to delete media", 500);
  }
}
