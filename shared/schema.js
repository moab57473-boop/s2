"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentType = exports.ParcelStatus = exports.insertDepartmentSchema = exports.insertBusinessRulesSchema = exports.insertParcelSchema = exports.departmentSchema = exports.businessRulesSchema = exports.parcelSchema = void 0;
const zod_1 = require("zod");
;
exports.parcelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    parcelId: zod_1.z.string(),
    weight: zod_1.z.number(),
    value: zod_1.z.number(),
    department: zod_1.z.string(),
    status: zod_1.z.string().default("pending"),
    requiresInsurance: zod_1.z.boolean().default(false),
    insuranceApproved: zod_1.z.boolean().default(false),
    processingTime: zod_1.z.date().default(() => new Date()),
    errorMessage: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date().default(() => new Date()),
    updatedAt: zod_1.z.date().default(() => new Date()),
});
exports.businessRulesSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    rules: zod_1.z.unknown(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().default(() => new Date()),
    updatedAt: zod_1.z.date().default(() => new Date()),
});
exports.departmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    color: zod_1.z.string(),
    icon: zod_1.z.string(),
    isCustom: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date().default(() => new Date()),
});
exports.insertParcelSchema = exports.parcelSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertBusinessRulesSchema = exports.businessRulesSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertDepartmentSchema = exports.departmentSchema.omit({
    id: true,
    createdAt: true,
});
exports.ParcelStatus = zod_1.z.enum([
    "pending",
    "processing",
    "completed",
    "insurance_review",
    "error"
]);
exports.DepartmentType = zod_1.z.enum([
    "mail",
    "regular",
    "heavy",
    "insurance",
    "custom"
]);
