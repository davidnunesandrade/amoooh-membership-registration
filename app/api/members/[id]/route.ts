import { NextRequest } from "next/server";
import { db } from "@/db";
import { member, memberMedia } from "@/db/schema/membership";
import { user } from "@/db/schema/auth";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, updateMemberSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

/**
 * GET /api/members/[id]
 * Get a specific member by ID with their associated media
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

    // Fetch member with user info
    const result = await db
      .select({
        id: member.id,
        userId: member.userId,
        companyId: member.companyId,
        role: member.role,
        phone: member.phone,
        position: member.position,
        bio: member.bio,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
      .where(eq(member.id, id))
      .limit(1);

    if (result.length === 0) {
      return errorResponse("Member not found", 404);
    }

    const memberData = result[0];

    // Check authorization - members can only view their own data unless admin
    if (memberData.userId !== currentUser.id && memberData.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    // Fetch associated media
    const associatedMedia = await db
      .select()
      .from(memberMedia)
      .where(eq(memberMedia.memberId, id));

    return successResponse({
      ...memberData,
      associatedMedia,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch member", 500);
  }
}

/**
 * PUT /api/members/[id]
 * Update a member profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse("Invalid ID", 400);
    }

    // Check if member exists and get their userId
    const existing = await db
      .select()
      .from(member)
      .where(eq(member.id, id))
      .limit(1);

    if (existing.length === 0) {
      return errorResponse("Member not found", 404);
    }

    // Check authorization - members can only update their own data
    if (existing[0].userId !== currentUser.id && existing[0].role !== "admin") {
      return errorResponse("Forbidden: Cannot update another member's profile", 403);
    }

    const validation = await validateRequest(request, updateMemberSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    // Prevent userId changes
    const { userId, ...updateData } = validation.data;

    const updated = await db
      .update(member)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(member.id, id))
      .returning();

    return successResponse(updated[0]);
  } catch (error) {
    console.error("Error updating member:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to update member", 500);
  }
}

/**
 * DELETE /api/members/[id]
 * Delete a member profile
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

    // Check if member exists and get their userId
    const existing = await db
      .select()
      .from(member)
      .where(eq(member.id, id))
      .limit(1);

    if (existing.length === 0) {
      return errorResponse("Member not found", 404);
    }

    // Check authorization - members can only delete their own data or admins can delete any
    if (existing[0].userId !== currentUser.id && existing[0].role !== "admin") {
      return errorResponse("Forbidden: Cannot delete another member's profile", 403);
    }

    await db
      .delete(member)
      .where(eq(member.id, id));

    return successResponse({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to delete member", 500);
  }
}
