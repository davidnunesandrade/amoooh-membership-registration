import { z } from "zod";

/**
 * Validation schemas for API requests using Zod
 */

// DisplayMedium schemas
export const displayMediumSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().min(1, "Type is required"),
  location: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateDisplayMediumSchema = displayMediumSchema.partial();

// Agency schemas
export const agencySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
});

export const updateAgencySchema = agencySchema.partial();

// Advertiser schemas
export const advertiserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  agencyId: z.number().int().positive("Invalid agency ID"),
  industry: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
});

export const updateAdvertiserSchema = advertiserSchema.partial().extend({
  agencyId: z.number().int().positive("Invalid agency ID").optional(),
});

// Member schemas
export const memberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  companyId: z.number().int().positive().optional().nullable(),
  role: z.string().default("member"),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export const updateMemberSchema = memberSchema.partial().extend({
  userId: z.string().optional(),
});

// MemberMedia schemas
export const memberMediaSchema = z.object({
  displayMediumId: z.number().int().positive("Invalid display medium ID"),
});

export const memberMediaBatchSchema = z.object({
  displayMediumIds: z.array(z.number().int().positive()),
});

// Pagination and filtering
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Query filters
export const mediaFilters = paginationSchema.extend({
  type: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
});

export const agencyFilters = paginationSchema.extend({
  search: z.string().optional(),
});

export const advertiserFilters = paginationSchema.extend({
  agencyId: z.coerce.number().int().positive().optional(),
  industry: z.string().optional(),
  search: z.string().optional(),
});

export const memberFilters = paginationSchema.extend({
  role: z.string().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

/**
 * Validate request body against a schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: message };
    }
    return { success: false, error: "Invalid request body" };
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQuery<T>(
  url: URL,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: message };
    }
    return { success: false, error: "Invalid query parameters" };
  }
}
