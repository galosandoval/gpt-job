import { createInsertSchema } from "drizzle-zod"
import { profile, resume, school, work } from "./schema"
import { z } from "zod"

const contactSchema = z.object({
  phone: z.string().optional(),
  linkedIn: z.string().optional(),
  portfolio: z.string().optional(),
  location: z.string().min(3, "Must be at least 3 characters")
})

export const insertContactSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Must be at least 1 characters")
      .max(50, "Must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Must be at least 1 characters")
      .max(50, "Must be less than 50 characters"),

    id: z.string().optional(),
    profession: z.string().min(3).max(255),
    interests: z.string().min(3).max(255).optional()
  })
  .merge(contactSchema)

export type InsertContactSchema = z.infer<typeof insertContactSchema>

export const updateProfileSchema = createInsertSchema(profile, {
  profession: (schema) =>
    schema.profession
      .min(3, "Must be at least 3 characters")
      .max(255, "Must be less than 255 characters"),
  interests: (schema) =>
    schema.interests
      .min(3, "Must be at least 3 characters")
      .max(255, "Must be less than 255 characters")
      .optional()
      .nullable(),
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
    profileId: (schema) => schema.profileId.cuid2().optional()
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
    name: (schema) =>
      schema.name
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters"),
    description: (schema) =>
      schema.description
        .min(6, "Must be more than 6 characters")
        .max(1000, "Must be less than 1000 characters")
        .refine(
          (arg) => arg.split(".").length > 3,
          "Must be at least 3 sentences"
        ),
    endDate: (schema) =>
      schema.endDate.min(3, "Must be at least 3 characters").max(50),
    startDate: (schema) =>
      schema.startDate.min(3, "Must be at least 3 characters").max(50),
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

export const maxSkills = 4

export const insertSkillsSchema = z.object({
  skills: z
    .object({
      category: z.string().min(3),
      all: z.string(),
      position: z.number()
    })
    .array()
    .min(1)
    .max(maxSkills)
})

export type InsertSkillsSchema = z.infer<typeof insertSkillsSchema>

export const insertResumeSchema = createInsertSchema(resume, {
  id: (schema) => schema.id.optional(),
  profession: (schema) =>
    schema.profession
      .min(3, "Must be at least 3 characters")
      .max(255, "Must be less than 255 characters"),
  profileId: (schema) => schema.profileId.cuid2().optional()
})
  .merge(
    z.object({
      phone: z.string(),
      linkedIn: z.string(),
      portfolio: z.string(),
      location: z.string().min(3, "Must be at least 3 characters")
    })
  )
  .merge(insertEducationSchema)
  .merge(insertExperienceSchema)
  .merge(insertSkillsSchema)
  .merge(z.object({ email: z.string().email() }))

export type InsertResumeSchema = z.infer<typeof insertResumeSchema>

export const downloadPdfSchema = z
  .object({
    fullName: z.string(),
    email: z.string().email(),
    profession: z.string()
  })
  .merge(contactSchema)
  .merge(
    updateProfileSchema.pick({
      interests: true
    })
  )
  .merge(insertEducationSchema)
  .merge(insertExperienceSchema)
  .merge(insertSkillsSchema)

export type DownloadPdfSchema = z.infer<typeof downloadPdfSchema>
