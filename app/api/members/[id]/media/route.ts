import { NextRequest } from "next/server";
import { db } from "@/db";
import { member, memberMedia, displayMedium } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, memberMediaSchema, memberMediaBatchSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/members/[id]/media
 * Get all media associated with a member
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    // Check if member exists and verify authorization
    const memberData = await db
      .select()
      .from(member)
      .where(eq(member.id, id))
      .limit(1);

    if (memberData.length === 0) {
      return errorResponse("Member not found", 404);
    }

    // Check authorization
    if (memberData[0].userId !== currentUser.id && memberData[0].role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    // Fetch associated media with details
    const media = await db
      .select({
        id: displayMedium.id,
        name: displayMedium.name,
        type: displayMedium.type,
        location: displayMedium.location,
        contactInfo: displayMedium.contactInfo,
        description: displayMedium.description,
        associatedAt: memberMedia.createdAt,
      })
      .from(memberMedia)
      .innerJoin(displayMedium, eq(memberMedia.displayMediumId, displayMedium.id))
      .where(eq(memberMedia.memberId, id));

    return successResponse(media);
  } catch (error) {
    console.error("Error fetching member media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch member media", 500);
  }
}

/**
 * POST /api/members/[id]/media
 * Add media associations to a member (single or batch)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    // Check if member exists and verify authorization
    const memberData = await db
      .select()
      .from(member)
      .where(eq(member.id, id))
      .limit(1);

    if (memberData.length === 0) {
      return errorResponse("Member not found", 404);
    }

    // Check authorization - members can only update their own media
    if (memberData[0].userId !== currentUser.id && memberData[0].role !== "admin") {
      return errorResponse("Forbidden: Cannot update another member's media", 403);
    }

    // Try to parse as batch first, then single
    const body = await request.json();
    let mediaIds: number[] = [];

    if (Array.isArray(body.displayMediumIds)) {
      // Batch operation
      const validation = memberMediaBatchSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse("Invalid media IDs", 400);
      }
      mediaIds = validation.data.displayMediumIds;
    } else if (body.displayMediumId) {
      // Single operation
      const validation = memberMediaSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse("Invalid media ID", 400);
      }
      mediaIds = [validation.data.displayMediumId];
    } else {
      return errorResponse("Missing displayMediumId or displayMediumIds", 400);
    }

    // Insert associations (ignore conflicts for idempotency)
    const associations = mediaIds.map((mediaId) => ({
      memberId: id,
      displayMediumId: mediaId,
    }));

    const inserted = await db
      .insert(memberMedia)
      .values(associations)
      .onConflictDoNothing()
      .returning();

    return successResponse({
      message: `Added ${inserted.length} media association(s)`,
      associations: inserted,
    }, 201);
  } catch (error) {
    console.error("Error adding member media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to add member media", 500);
  }
}

/**
 * DELETE /api/members/[id]/media
 * Remove media associations from a member
 * Accepts: { displayMediumId: number } or { displayMediumIds: number[] }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    // Check if member exists and verify authorization
    const memberData = await db
      .select()
      .from(member)
      .where(eq(member.id, id))
      .limit(1);

    if (memberData.length === 0) {
      return errorResponse("Member not found", 404);
    }

    // Check authorization
    if (memberData[0].userId !== currentUser.id && memberData[0].role !== "admin") {
      return errorResponse("Forbidden: Cannot update another member's media", 403);
    }

    // Parse body
    const body = await request.json();
    let mediaIds: number[] = [];

    if (Array.isArray(body.displayMediumIds)) {
      mediaIds = body.displayMediumIds;
    } else if (body.displayMediumId) {
      mediaIds = [body.displayMediumId];
    } else {
      return errorResponse("Missing displayMediumId or displayMediumIds", 400);
    }

    // Delete associations
    const deletePromises = mediaIds.map((mediaId) =>
      db
        .delete(memberMedia)
        .where(
          and(
            eq(memberMedia.memberId, id),
            eq(memberMedia.displayMediumId, mediaId)
          )
        )
    );

    await Promise.all(deletePromises);

    return successResponse({
      message: `Removed ${mediaIds.length} media association(s)`,
    });
  } catch (error) {
    console.error("Error removing member media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to remove member media", 500);
  }
}
