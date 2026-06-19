import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  courses,
  testimonials,
  newsEvents,
  instructors,
  galleryItems,
  faqs,
  contactMessages,
  enrollments,
  siteSettings,
  payments,
} from "@db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export const publicRouter = createRouter({
  // ─── HEALTH CHECK ───
  health: publicQuery.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),

  // ─── SETTINGS ───
  settings: createRouter({
    get: publicQuery.query(async () => {
      const db = getDb();
      const result = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
      return result[0] ?? null;
    }),
  }),

  // ─── COURSES ───
  courses: createRouter({
    list: publicQuery
      .input(
        z.object({
          category: z.string().optional(),
          featured: z.boolean().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [eq(courses.isPublished, true)];
        if (input?.category) {
          conditions.push(eq(courses.category, input.category as any));
        }
        if (input?.featured) {
          conditions.push(eq(courses.isFeatured, true));
        }
        return db
          .select()
          .from(courses)
          .where(and(...conditions))
          .orderBy(asc(courses.displayOrder));
      }),

    getBySlug: publicQuery
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = getDb();
        const result = await db
          .select()
          .from(courses)
          .where(and(eq(courses.slug, input.slug), eq(courses.isPublished, true)));
        return result[0] ?? null;
      }),
  }),

  // ─── TESTIMONIALS ───
  testimonials: createRouter({
    list: publicQuery
      .input(
        z.object({
          featured: z.boolean().optional(),
          limit: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [
          eq(testimonials.isPublished, true),
          eq(testimonials.isApproved, true),
        ];
        if (input?.featured) {
          conditions.push(eq(testimonials.isFeatured, true));
        }
        let query = db
          .select()
          .from(testimonials)
          .where(and(...conditions))
          .orderBy(desc(testimonials.submittedAt));
        if (input?.limit) {
          query = query.limit(input.limit) as any;
        }
        return query;
      }),
  }),

  // ─── NEWS & EVENTS ───
  news: createRouter({
    list: publicQuery
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [eq(newsEvents.isPublished, true)];
        if (input?.category) {
          conditions.push(eq(newsEvents.category, input.category as any));
        }
        let query = db
          .select()
          .from(newsEvents)
          .where(and(...conditions))
          .orderBy(desc(newsEvents.publishedAt));
        if (input?.limit) {
          query = query.limit(input.limit) as any;
        }
        return query;
      }),

    getBySlug: publicQuery
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = getDb();
        const result = await db
          .select()
          .from(newsEvents)
          .where(and(eq(newsEvents.slug, input.slug), eq(newsEvents.isPublished, true)));
        return result[0] ?? null;
      }),
  }),

  // ─── INSTRUCTORS ───
  instructors: createRouter({
    list: publicQuery
      .input(
        z.object({
          department: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [eq(instructors.isPublished, true)];
        if (input?.department) {
          conditions.push(eq(instructors.department, input.department as any));
        }
        return db
          .select()
          .from(instructors)
          .where(and(...conditions))
          .orderBy(asc(instructors.displayOrder));
      }),
  }),

  // ─── GALLERY ───
  gallery: createRouter({
    list: publicQuery
      .input(
        z.object({
          category: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [];
        if (input?.category) {
          conditions.push(eq(galleryItems.category, input.category as any));
        }
        const query = conditions.length > 0
          ? db.select().from(galleryItems).where(and(...conditions)).orderBy(asc(galleryItems.displayOrder))
          : db.select().from(galleryItems).orderBy(asc(galleryItems.displayOrder));
        return query;
      }),
  }),

  // ─── FAQS ───
  faqs: createRouter({
    list: publicQuery
      .input(
        z.object({
          category: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [eq(faqs.isPublished, true)];
        if (input?.category) {
          conditions.push(eq(faqs.category, input.category as any));
        }
        return db
          .select()
          .from(faqs)
          .where(and(...conditions))
          .orderBy(asc(faqs.displayOrder));
      }),
  }),

  // ─── CONTACT ───
  contact: createRouter({
    submit: publicQuery
      .input(
        z.object({
          fullName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string().min(1),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.insert(contactMessages).values({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
        });
        return { success: true, message: "Message sent successfully" };
      }),
  }),

  // ─── ENROLLMENTS ───
  enrollments: createRouter({
    submit: publicQuery
      .input(
        z.object({
          fullName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().min(1),
          whatsapp: z.string().optional(),
          dateOfBirth: z.string().optional(),
          gender: z.string().optional(),
          nationality: z.string().optional(),
          nationalId: z.string().optional(),
          district: z.string().optional(),
          courseId: z.number(),
          languageOption: z.string().optional(),
          languageLevel: z.string().optional(),
          examOption: z.string().optional(),
          schedulePreference: z.string().optional(),
          preferredStartDate: z.string().optional(),
          referralSource: z.string().optional(),
          educationLevel: z.string().optional(),
          occupation: z.string().optional(),
          specialNeeds: z.string().optional(),
          emergencyName: z.string().optional(),
          emergencyPhone: z.string().optional(),
          emergencyRelation: z.string().optional(),
          paymentRef: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const refNum = `PI-ENRL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await db.insert(enrollments).values({
          referenceNumber: refNum,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          whatsapp: input.whatsapp,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          gender: input.gender,
          nationality: input.nationality,
          nationalId: input.nationalId,
          district: input.district,
          courseId: input.courseId,
          languageOption: input.languageOption,
          languageLevel: input.languageLevel,
          examOption: input.examOption,
          schedulePreference: input.schedulePreference,
          preferredStartDate: input.preferredStartDate ? new Date(input.preferredStartDate) : null,
          referralSource: input.referralSource,
          educationLevel: input.educationLevel,
          occupation: input.occupation,
          specialNeeds: input.specialNeeds,
          emergencyName: input.emergencyName,
          emergencyPhone: input.emergencyPhone,
          emergencyRelation: input.emergencyRelation,
          paymentStatus: input.paymentRef ? "fully_paid" : "not_paid",
        });
        if (input.paymentRef) {
          await db.update(payments)
            .set({ enrollmentRef: refNum, status: "success", verifiedAt: new Date() })
            .where(eq(payments.referenceNumber, input.paymentRef));
        }
        return { success: true, referenceNumber: refNum };
      }),

    checkStatus: publicQuery
      .input(z.object({ reference: z.string() }))
      .query(async ({ input }) => {
        const db = getDb();
        const result = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.referenceNumber, input.reference));
        return result[0] ?? null;
      }),
  }),

  // ─── PAYMENTS ───
  payments: createRouter({
    initiate: publicQuery
      .input(
        z.object({
          provider: z.enum(["MOMO", "AIRTEL"]),
          amount: z.number().int().positive(),
          phoneNumber: z.string().min(1),
          courseId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const refNum = `PI-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        // In production, integrate with MTN MoMo / Airtel Money APIs here
        // For now, payment is auto-approved
        await db.insert(payments).values({
          referenceNumber: refNum,
          provider: input.provider,
          amount: input.amount,
          phoneNumber: input.phoneNumber,
          status: "success",
          verifiedAt: new Date(),
        });
        return {
          success: true,
          referenceNumber: refNum,
          provider: input.provider,
          amount: input.amount,
          phoneNumber: input.phoneNumber,
          status: "success",
        };
      }),

    verify: publicQuery
      .input(z.object({ reference: z.string() }))
      .query(async ({ input }) => {
        const db = getDb();
        const result = await db
          .select()
          .from(payments)
          .where(eq(payments.referenceNumber, input.reference));
        return result[0] ?? null;
      }),
  }),
});
