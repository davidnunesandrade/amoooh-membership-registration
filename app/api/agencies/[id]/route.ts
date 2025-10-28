import { NextRequest } from "next/server";
import { db } from "@/db";
import { agency } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, updateAgencySchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

/**
 * GET /api/agencies/[id]
 * Get a specific agency by ID
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
      .from(agency)
      .where(eq(agency.id, id))
      .limit(1);

    if (result.length === 0) {
      return errorResponse("Agency not found", 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error("Error fetching agency:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch agency", 500);
  }
}

/**
 * PUT /api/agencies/[id]
 * Update an agency
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

    const validation = await validateRequest(request, updateAgencySchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const updated = await db
      .update(agency)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(agency.id, id))
      .returning();

    if (updated.length === 0) {
      return errorResponse("Agency not found", 404);
    }

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating agency:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to update agency", 500);
  }
}

/**
 * DELETE /api/agencies/[id]
 * Delete an agency
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
      .delete(agency)
      .where(eq(agency.id, id))
      .returning();

    if (deleted.length === 0) {
      return errorResponse("Agency not found", 404);
    }

    return successResponse({ message: "Agency deleted successfully" });
  } catch (error) {
    console.error("Error deleting agency:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to delete agency", 500);
  }
}
