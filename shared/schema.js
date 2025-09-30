import { z } from 'zod';

export const parcelSchema = z.object({
  id: z.string(),
  parcelId: z.string(),
  weight: z.number(),
  value: z.number(),
  department: z.string(),
  status: z.string().default("pending"),
  requiresInsurance: z.boolean().default(false),
  insuranceApproved: z.boolean().default(false),
  processingTime: z.date().default(() => new Date()),
  errorMessage: z.string().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const businessRulesSchema = z.object({
  id: z.string(),
  name: z.string(),
  rules: z.unknown(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  icon: z.string(),
  isCustom: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export const insertParcelSchema = parcelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessRulesSchema = businessRulesSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = departmentSchema.omit({
  id: true,
  createdAt: true,
});

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