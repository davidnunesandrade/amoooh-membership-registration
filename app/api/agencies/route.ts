import { NextRequest } from "next/server";
import { db } from "@/db";
import { agency } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, validateQuery, agencySchema, agencyFilters } from "@/lib/validations";
import { ilike, or, asc, desc, sql } from "drizzle-orm";

/**
 * GET /api/agencies
 * List all agencies with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const url = new URL(request.url);
    const validation = validateQuery(url, agencyFilters);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { page, limit, sortBy, sortOrder, search } = validation.data;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(agency.name, `%${search}%`),
          ilike(agency.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(agency)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === "desc" ? desc(agency[sortBy as keyof typeof agency] || agency.id) : asc(agency[sortBy as keyof typeof agency] || agency.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(agency)
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
    console.error("Error fetching agencies:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch agencies", 500);
  }
}

/**
 * POST /api/agencies
 * Create a new agency
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const validation = await validateRequest(request, agencySchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const newAgency = await db
      .insert(agency)
      .values(validation.data)
      .returning();

    return successResponse(newAgency[0], 201);
  } catch (error) {
    console.error("Error creating agency:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to create agency", 500);
  }
}
