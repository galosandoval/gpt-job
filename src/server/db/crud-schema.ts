import { createInsertSchema } from "drizzle-zod"
import { profile, school, work } from "./schema"
import { z } from "zod"

export const insertNameSchema = z.object({
  firstName: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(50, "Must be less than 50 characters"),
  lastName: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(50, "Must be less than 50 characters"),
  id: z.string().optional()
})

export type InsertNameSchema = z.infer<typeof insertNameSchema>

export const updateProfileSchema = createInsertSchema(profile, {
  profession: (schema) =>
    schema.profession
      .min(3, "Must be at least 3 characters")
      .max(255, "Must be less than 255 characters"),
  introduction: (schema) =>
    schema.introduction
      .min(3, "Must be atleast 3 characters")
      .max(500, "Must be less than 500 characters"),
  interests: (schema) =>
    schema.interests
      .min(3, "Must be at least 3 characters")
      .max(255, "Must be less than 255 characters"),
  skills: (schema) => schema.skills.optional(),
  id: (schema) => schema.id.optional()
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

export const insertEducationSchema = z.object({
  education: createInsertSchema(school, {
    id: (schema) => schema.id.optional(),
    degree: (schema) =>
      schema.degree
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters"),
    name: (schema) =>
      schema.name
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters"),
    description: (schema) =>
      schema.description
        .max(500, "Must be less than 500 characters")
        .optional(),
    location: (schema) =>
      schema.location.max(255, "Must be less than 255 characters").optional(),
    startDate: (schema) => schema.startDate.min(4).max(50),
    endDate: (schema) => schema.endDate.min(4).max(50),
    gpa: (schema) => schema.gpa.optional(),
    profileId: (schema) => schema.profileId.cuid2().optional(),
    keyAchievements: (schema) => schema.keyAchievements.optional()
  })
    .array()
    .min(1)
    .max(4)
})

export type InsertEducationSchema = z.infer<typeof insertEducationSchema>

export const insertExperienceSchema = z.object({
  experience: createInsertSchema(work, {
    id: (schema) => schema.id.optional(),
    profileId: (schema) => schema.profileId.optional(),
    companyName: (schema) =>
      schema.companyName
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters"),
    description: (schema) =>
      schema.description
        .min(6, "Must be more than 6 characters")
        .max(500, "Must be less than 500 characters"),
    endDate: (schema) => schema.endDate.min(4).max(50),
    startDate: (schema) => schema.startDate.min(4).max(50),
    title: (schema) =>
      schema.title
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters")
  })
    .array()
    .min(1)
    .max(5)
})

export type InsertExperienceSchema = z.infer<typeof insertExperienceSchema>

export const maxSkills = 20

export const insertSkillsSchema = z.object({
  skills: z
    .object({ value: z.string().min(3) })
    .array()
    .min(1)
    .max(maxSkills)
})

export type InsertSkillsSchema = z.infer<typeof insertSkillsSchema>
