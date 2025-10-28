import { pgTable, serial, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

/**
 * DisplayMedium table
 * Represents different types of media (TV, Online, Print, etc.)
 */
export const displayMedium = pgTable("display_medium", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // e.g., "TV", "Online", "Print", "Radio", "Outdoor"
  location: text("location"), // Physical or virtual location
  contactInfo: text("contact_info"), // JSON string with contact details
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Agency table
 * Represents advertising/media agencies
 */
export const agency = pgTable("agency", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  contactInfo: text("contact_info"), // JSON string with email, phone, etc.
  description: text("description"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Advertiser table
 * Represents companies that advertise through agencies
 */
export const advertiser = pgTable("advertiser", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  agencyId: integer("agency_id")
    .notNull()
    .references(() => agency.id, { onDelete: "cascade" }),
  industry: text("industry"), // e.g., "Technology", "Finance", "Retail"
  contactInfo: text("contact_info"), // JSON string with contact details
  description: text("description"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Member table
 * Extended user profile for AMOOH members with company association
 * Links to Better Auth's user table
 */
export const member = pgTable("member", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  companyId: integer("company_id").references(() => displayMedium.id, { onDelete: "set null" }), // Optional: member's company (Display Medium)
  role: text("role").notNull().default("member"), // e.g., "member", "admin", "viewer"
  phone: text("phone"),
  position: text("position"), // Job title/position
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * MemberMedia join table
 * Many-to-many relationship between Members and Display Mediums
 * Tracks which media a member is associated with or manages
 */
export const memberMedia = pgTable("member_media", {
  memberId: integer("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  displayMediumId: integer("display_medium_id")
    .notNull()
    .references(() => displayMedium.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.memberId, table.displayMediumId] }),
}));

// ============================================
// Relations for type-safe joins with Drizzle
// ============================================

/**
 * Agency relations
 */
export const agencyRelations = relations(agency, ({ many }) => ({
  advertisers: many(advertiser),
}));

/**
 * Advertiser relations
 */
export const advertiserRelations = relations(advertiser, ({ one }) => ({
  agency: one(agency, {
    fields: [advertiser.agencyId],
    references: [agency.id],
  }),
}));

/**
 * Member relations
 */
export const memberRelations = relations(member, ({ one, many }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  company: one(displayMedium, {
    fields: [member.companyId],
    references: [displayMedium.id],
  }),
  memberMedia: many(memberMedia),
}));

/**
 * DisplayMedium relations
 */
export const displayMediumRelations = relations(displayMedium, ({ many }) => ({
  members: many(member), // Members who work for this media company
  memberMedia: many(memberMedia), // Members associated with this media
}));

/**
 * MemberMedia relations
 */
export const memberMediaRelations = relations(memberMedia, ({ one }) => ({
  member: one(member, {
    fields: [memberMedia.memberId],
    references: [member.id],
  }),
  displayMedium: one(displayMedium, {
    fields: [memberMedia.displayMediumId],
    references: [displayMedium.id],
  }),
}));

// ============================================
// TypeScript types exported for use in the app
// ============================================

export type DisplayMedium = typeof displayMedium.$inferSelect;
export type NewDisplayMedium = typeof displayMedium.$inferInsert;

export type Agency = typeof agency.$inferSelect;
export type NewAgency = typeof agency.$inferInsert;

export type Advertiser = typeof advertiser.$inferSelect;
export type NewAdvertiser = typeof advertiser.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type MemberMedia = typeof memberMedia.$inferSelect;
export type NewMemberMedia = typeof memberMedia.$inferInsert;
