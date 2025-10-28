import { NextRequest } from "next/server";
import { db } from "@/db";
import { member } from "@/db/schema/membership";
import { user } from "@/db/schema/auth";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, validateQuery, memberSchema, memberFilters } from "@/lib/validations";
import { eq, ilike, or, asc, desc, sql } from "drizzle-orm";

/**
 * GET /api/members
 * List all members with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const url = new URL(request.url);
    const validation = validateQuery(url, memberFilters);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { page, limit, sortBy, sortOrder, role, companyId, search } = validation.data;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (role) {
      conditions.push(eq(member.role, role));
    }
    if (companyId) {
      conditions.push(eq(member.companyId, companyId));
    }
    if (search) {
      conditions.push(
        or(
          ilike(member.phone, `%${search}%`),
          ilike(member.position, `%${search}%`),
          ilike(member.bio, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const [data, countResult] = await Promise.all([
      db
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
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === "desc" ? desc(member[sortBy as keyof typeof member] || member.id) : asc(member[sortBy as keyof typeof member] || member.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(member)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return successResponse({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch members", 500);
  }
}

/**
 * POST /api/members
 * Create a new member profile
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);

    const validation = await validateRequest(request, memberSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    // Ensure users can only create their own member profile
    if (validation.data.userId !== currentUser.id) {
      return errorResponse("Cannot create member profile for another user", 403);
    }

    const newMember = await db
      .insert(member)
      .values(validation.data)
      .returning();

    return successResponse(newMember[0], 201);
  } catch (error) {
    console.error("Error creating member:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to create member", 500);
  }
}
