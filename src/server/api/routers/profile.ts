import { createId } from "@paralleldrive/cuid2"
import { TRPCError } from "@trpc/server"
import { asc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { db } from "~/server/db"
import {
  insertEducationSchema,
  insertExperienceSchema,
  insertContactSchema,
  updateProfileSchema
} from "~/server/db/crud-schema"
import { contact, profile, school, skill, user, work } from "~/server/db/schema"

export const profileRouter = createTRPCRouter({
  read: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2()
      })
    )
    .query(async ({ input, ctx }) => {
      const foundProfile = await ctx.db
        .select()
        .from(profile)
        .where(eq(profile.userId, input.userId))

      const result = !!foundProfile?.length && foundProfile[0]

      if (!result) {
        throw new TRPCError({
          message: "Profile not found",
          code: "NOT_FOUND"
        })
      }

      const foundUser = await ctx.db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, result.userId!))

      const contactInfo = await ctx.db
        .select()
        .from(contact)
        .where(eq(contact.profileId, result.id))

      const education = await ctx.db
        .select()
        .from(school)
        .where(eq(school.profileId, result.id))

      const experience = await ctx.db
        .select()
        .from(work)
        .where(eq(work.profileId, result.id))

      const skills = await ctx.db
        .select({
          category: skill.category,
          all: skill.all,
          position: skill.position,
          id: skill.id
        })
        .from(skill)
        .where(eq(skill.profileId, result.id))
        .orderBy(asc(skill.position))

      return {
        ...result,
        education,
        experience,
        contact: contactInfo[0],
        email: foundUser[0]?.email,
        skills
      }
    }),

  upsertNameAndContact: protectedProcedure
    .input(insertContactSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        firstName,
        lastName,
        linkedIn,
        location,
        phone,
        portfolio,
        id,
        profession
      } = input

      if (!id) {
        throw new TRPCError({
          message: "Profile ID not found",
          code: "INTERNAL_SERVER_ERROR"
        })
      }

      const updatedProfile = await ctx.db
        .update(profile)
        .set({ firstName, lastName, profession })
        .where(eq(profile.id, id))
        .returning()

      if (!updatedProfile?.length) {
        throw new TRPCError({
          message: "Profile not updated",
          code: "INTERNAL_SERVER_ERROR"
        })
      }

      const foundContact = await ctx.db
        .select({ id: contact.id })
        .from(contact)
        .where(eq(contact.profileId, id))

      if (foundContact.length) {
        const updatedContact = await ctx.db
          .update(contact)
          .set({ linkedIn, location, phone, portfolio })
          .returning()

        if (!updatedContact.length) {
          throw new TRPCError({
            message: "Contact not updated",
            code: "INTERNAL_SERVER_ERROR"
          })
        }
      } else {
        const newContact = await ctx.db
          .insert(contact)
          .values({
            id: createId(),
            location,
            phone,
            linkedIn,
            portfolio,
            profileId: id
          })
          .returning()

        if (!newContact.length) {
          throw new TRPCError({
            message: "Contact not created",
            code: "INTERNAL_SERVER_ERROR"
          })
        }
      }

      return updatedProfile[0]
    }),

  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const { profession, interests, introduction } = input

      return await ctx.db
        .update(profile)
        .set({
          profession,
          introduction,
          interests
        })
        .where(eq(profile.userId, ctx.session.user.id))
    }),

  addEducation: protectedProcedure
    .input(
      insertEducationSchema.merge(
        z.object({ profileId: z.string().cuid2().optional() })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const { education, profileId } = input

      if (profileId) {
        const foundEducation = await ctx.db
          .select()
          .from(school)
          .where(eq(school.profileId, profileId))

        const educationToDelete = foundEducation.map((e) => e.id)

        educationToDelete.forEach(
          async (id) => await db.delete(school).where(eq(school.id, id))
        )
      }

      const schoolsToInsert = education.map((e) => ({
        ...e,
        id: e?.id ? e.id : createId(),
        keyAchievements: []
      }))

      return await ctx.db
        .insert(school)
        .values(schoolsToInsert)
        .onConflictDoUpdate({
          target: school.id,
          set: {
            degree: sql`excluded.degree`,
            description: sql`excluded.description`,
            endDate: sql`excluded.end_date`,
            gpa: sql`excluded.gpa`,
            location: sql`excluded.location`,
            name: sql`excluded.name`,
            startDate: sql`excluded.start_date`,
            profileId: sql`excluded.profile_id`,
            id: sql`excluded.id`
          }
        })
    }),

  addWork: protectedProcedure
    .input(
      insertExperienceSchema.merge(
        z.object({ profileId: z.string().cuid2().optional() })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const { experience, profileId } = input

      if (profileId) {
        const foundWork = await ctx.db
          .select()
          .from(work)
          .where(eq(work.profileId, profileId))

        const workToDelete = foundWork.map((e) => e.id)

        workToDelete.forEach(
          async (id) => await db.delete(work).where(eq(work.id, id))
        )
      }

      const workToInsert = experience.map((e) => ({
        ...e,
        id: e?.id ? e.id : createId()
      }))

      return await ctx.db
        .insert(work)
        .values(
          workToInsert.map((w) => ({
            name: w.name,
            description: w.description,
            endDate: w.endDate,
            startDate: w.startDate,
            title: w.title,
            id: w.id,
            profileId: w.profileId
          }))
        )
        .onConflictDoUpdate({
          target: work.id,
          set: {
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            endDate: sql`excluded.end_date`,
            title: sql`excluded.title`,
            startDate: sql`excluded.start_date`,
            profileId: sql`excluded.profile_id`,
            id: sql`excluded.id`
          }
        })
    }),

  upsertSkills: protectedProcedure
    .input(
      z.object({
        skills: z
          .object({
            category: z.string().min(3),
            all: z.string().array(),
            position: z.number()
          })
          .array(),
        profileId: z.string().cuid2()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { skills, profileId } = input

      const foundSkills = await ctx.db
        .select()
        .from(skill)
        .where(eq(skill.profileId, profileId))

      if (foundSkills.length > skills.length) {
        const skillsToDelete = foundSkills.slice(skills.length).map((s) => s.id)

        skillsToDelete.forEach(
          async (id) => await db.delete(skill).where(eq(skill.id, id))
        )

        for (let i = 0; i < skills.length; i++) {
          await ctx.db
            .update(skill)
            .set({
              category: skills[i]?.category,
              all: skills[i]?.all,
              position: skills[i]?.position
            })
            .where(eq(skill.id, foundSkills[i]?.id!))
        }
      } else if (foundSkills.length < skills.length) {
        const skillsToInsert = skills.slice(foundSkills.length)
        await ctx.db
          .insert(skill)
          .values(
            skillsToInsert.map((s) => ({ ...s, profileId, id: createId() }))
          )

        if (foundSkills.length) {
          const idxToUpdate = skills.length - foundSkills.length

          for (let i = 0; i < idxToUpdate; i++) {
            await ctx.db
              .update(skill)
              .set({
                category: skills[i]?.category,
                all: skills[i]?.all,
                position: skills[i]?.position
              })
              .where(eq(skill.id, foundSkills[i]?.id!))
          }
        }
      } else {
        for (let i = 0; i < skills.length; i++) {
          await ctx.db
            .update(skill)
            .set({
              category: skills[i]?.category,
              all: skills[i]?.all,
              position: skills[i]?.position
            })
            .where(eq(skill.id, foundSkills[i]?.id!))
        }
      }

      return { success: true }
    })
})
