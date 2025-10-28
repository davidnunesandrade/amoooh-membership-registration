import { NextRequest } from "next/server";
import { db } from "@/db";
import { advertiser } from "@/db/schema/membership";
import { requireAuth, errorResponse, successResponse } from "@/lib/auth-middleware";
import { validateRequest, validateQuery, advertiserSchema, advertiserFilters } from "@/lib/validations";
import { eq, ilike, or, asc, desc, sql } from "drizzle-orm";

/**
 * GET /api/advertisers
 * List all advertisers with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const url = new URL(request.url);
    const validation = validateQuery(url, advertiserFilters);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { page, limit, sortBy, sortOrder, agencyId, industry, search } = validation.data;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (agencyId) {
      conditions.push(eq(advertiser.agencyId, agencyId));
    }
    if (industry) {
      conditions.push(eq(advertiser.industry, industry));
    }
    if (search) {
      conditions.push(
        or(
          ilike(advertiser.name, `%${search}%`),
          ilike(advertiser.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(advertiser)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === "desc" ? desc(advertiser[sortBy as keyof typeof advertiser] || advertiser.id) : asc(advertiser[sortBy as keyof typeof advertiser] || advertiser.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(advertiser)
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
    console.error("Error fetching advertisers:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to fetch advertisers", 500);
  }
}

/**
 * POST /api/advertisers
 * Create a new advertiser
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const validation = await validateRequest(request, advertiserSchema);

    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const newAdvertiser = await db
      .insert(advertiser)
      .values(validation.data)
      .returning();

    return successResponse(newAdvertiser[0], 201);
  } catch (error) {
    console.error("Error creating advertiser:", error);
    if ((error as Error).message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Failed to create advertiser", 500);
  }
}
