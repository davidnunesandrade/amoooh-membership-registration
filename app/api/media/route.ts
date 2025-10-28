import { NextRequest } from "next/server";
import { db } from "@/db";
import { displayMedium } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, validateQuery, displayMediumSchema, mediaFilters } from "@/lib/validations";
import { eq, ilike, or, asc, desc, sql } from "drizzle-orm";

/**
 * GET /api/media
 * List all display mediums with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const url = new URL(request.url);
    const validation = validateQuery(url, mediaFilters);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { page, limit, sortBy, sortOrder, type, location, search } = validation.data;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (type) {
      conditions.push(eq(displayMedium.type, type));
    }
    if (location) {
      conditions.push(ilike(displayMedium.location, `%${location}%`));
    }
    if (search) {
      conditions.push(
        or(
          ilike(displayMedium.name, `%${search}%`),
          ilike(displayMedium.description, `%${search}%`)
        )
      );
    }

    // Execute query with filters
    const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(displayMedium)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === "desc" ? desc(displayMedium[sortBy as keyof typeof displayMedium] || displayMedium.id) : asc(displayMedium[sortBy as keyof typeof displayMedium] || displayMedium.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(displayMedium)
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
    console.error("Error fetching media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch media", 500);
  }
}

/**
 * POST /api/media
 * Create a new display medium
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const validation = await validateRequest(request, displayMediumSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const newMedium = await db
      .insert(displayMedium)
      .values(validation.data)
      .returning();

    return successResponse(newMedium[0], 201);
  } catch (error) {
    console.error("Error creating media:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to create media", 500);
  }
}
