import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parcels = pgTable("parcels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parcelId: text("parcel_id").notNull().unique(),
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("pending"),
  requiresInsurance: boolean("requires_insurance").notNull().default(false),
  insuranceApproved: boolean("insurance_approved").notNull().default(false),
  processingTime: timestamp("processing_time").notNull().defaultNow(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const businessRules = pgTable("business_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  rules: json("rules").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  isCustom: boolean("is_custom").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParcelSchema = createInsertSchema(parcels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessRulesSchema = createInsertSchema(businessRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export type InsertParcel = z.infer<typeof insertParcelSchema>;
export type Parcel = typeof parcels.$inferSelect;
export type InsertBusinessRules = z.infer<typeof insertBusinessRulesSchema>;
export type BusinessRules = typeof businessRules.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export const ParcelStatus = z.enum([
  "pending",
  "processing", 
  "completed",
  "insurance_review",
  "error"
]);

export const DepartmentType = z.enum([
  "mail",
  "regular", 
  "heavy",
  "insurance",
  "custom"
]);

export type ParcelStatusType = z.infer<typeof ParcelStatus>;
export type DepartmentTypeType = z.infer<typeof DepartmentType>;
