import { NextRequest } from "next/server";
import { db } from "@/db";
import { advertiser } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, updateAdvertiserSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

/**
 * GET /api/advertisers/[id]
 * Get a specific advertiser by ID
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

    const result = await db
      .select()
      .from(advertiser)
      .where(eq(advertiser.id, id))
      .limit(1);

    if (result.length === 0) {
      return errorResponse("Advertiser not found", 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching advertiser:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch advertiser", 500);
  }
}

/**
 * PUT /api/advertisers/[id]
 * Update an advertiser
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

    const validation = await validateRequest(request, updateAdvertiserSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const updated = await db
      .update(advertiser)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(advertiser.id, id))
      .returning();

    if (updated.length === 0) {
      return errorResponse("Advertiser not found", 404);
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating advertiser:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to update advertiser", 500);
  }
}

/**
 * DELETE /api/advertisers/[id]
 * Delete an advertiser
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
      .delete(advertiser)
      .where(eq(advertiser.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse("Advertiser not found", 404);
    }

    return successResponse({ message: "Advertiser deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertiser:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to delete advertiser", 500);
  }
}
