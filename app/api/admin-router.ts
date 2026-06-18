import { z } from "zod";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  courses,
  testimonials,
  newsEvents,
  contactMessages,
  enrollments,
  siteSettings,
  adminUsers,
} from "@db/schema";
import { eq, desc, asc, or, like, count } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";

export const adminRouter = createRouter({
  // ─── LOGIN (Public - used for admin login) ───
  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, input.email));
      const user = result[0];
      if (!user || !user.isActive) {
        throw new Error("Invalid credentials");
      }
      const valid = compareSync(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid credentials");
      }
      await db
        .update(adminUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(adminUsers.id, user.id));
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }),

  // ─── DASHBOARD STATS ───
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [enrollmentCount] = await db
      .select({ count: count() })
      .from(enrollments);
    const [pendingCount] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "pending"));
    const [enrolledCount] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "enrolled"));
    const [messageCount] = await db
      .select({ count: count() })
      .from(contactMessages)
      .where(eq(contactMessages.isRead, false));
    const [courseCount] = await db
      .select({ count: count() })
      .from(courses);
    const [testimonialCount] = await db
      .select({ count: count() })
      .from(testimonials);

    return {
      totalEnrollments: enrollmentCount.count,
      pendingEnrollments: pendingCount.count,
      confirmedEnrollments: enrolledCount.count,
      unreadMessages: messageCount.count,
      totalCourses: courseCount.count,
      totalTestimonials: testimonialCount.count,
    };
  }),

  // ─── ENROLLMENTS MANAGEMENT ───
  enrollmentList: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.search) {
        return db
          .select()
          .from(enrollments)
          .where(
            or(
              like(enrollments.fullName, `%${input.search}%`),
              like(enrollments.email, `%${input.search}%`),
              like(enrollments.referenceNumber, `%${input.search}%`)
            )
          )
          .orderBy(desc(enrollments.submittedAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
      }
      if (input?.status) {
        return db
          .select()
          .from(enrollments)
          .where(eq(enrollments.status, input.status as any))
          .orderBy(desc(enrollments.submittedAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
      }
      return db
        .select()
        .from(enrollments)
        .orderBy(desc(enrollments.submittedAt))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  enrollmentUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "under_review", "enrolled", "rejected", "waitlisted", "completed"]).optional(),
        paymentStatus: z.enum(["not_paid", "partially_paid", "fully_paid"]).optional(),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: any = {};
      if (input.status) updates.status = input.status;
      if (input.paymentStatus) updates.paymentStatus = input.paymentStatus;
      if (input.adminNotes !== undefined) updates.adminNotes = input.adminNotes;
      await db.update(enrollments).set(updates).where(eq(enrollments.id, input.id));
      return { success: true };
    }),

  // ─── COURSES MANAGEMENT ───
  courseList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(courses).orderBy(asc(courses.displayOrder));
  }),

  courseCreate: adminQuery
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        category: z.enum(["languages", "bakery", "salon", "mechanics", "ai_skills", "private_candidate"]),
        shortDesc: z.string(),
        description: z.string(),
        duration: z.string(),
        isPublished: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(courses).values(input);
      return { success: true };
    }),

  courseUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(courses).set(input.data).where(eq(courses.id, input.id));
      return { success: true };
    }),

  courseDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(courses).where(eq(courses.id, input.id));
      return { success: true };
    }),

  // ─── NEWS MANAGEMENT ───
  newsList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(newsEvents).orderBy(desc(newsEvents.createdAt));
  }),

  newsCreate: adminQuery
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        category: z.enum(["news", "event", "achievement", "announcement"]),
        excerpt: z.string(),
        content: z.string(),
        authorName: z.string(),
        isPublished: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(newsEvents).values({
        ...input,
        publishedAt: input.isPublished ? new Date() : null,
      });
      return { success: true };
    }),

  newsUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(newsEvents).set(input.data).where(eq(newsEvents.id, input.id));
      return { success: true };
    }),

  newsDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(newsEvents).where(eq(newsEvents.id, input.id));
      return { success: true };
    }),

  // ─── TESTIMONIALS MANAGEMENT ───
  testimonialList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(testimonials).orderBy(desc(testimonials.submittedAt));
  }),

  testimonialUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(testimonials).set(input.data).where(eq(testimonials.id, input.id));
      return { success: true };
    }),

  // ─── CONTACT MESSAGES ───
  messageList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }),

  messageUpdate: adminQuery
    .input(
      z.object({
        id: z.number(),
        isRead: z.boolean().optional(),
        isReplied: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: any = {};
      if (input.isRead !== undefined) updates.isRead = input.isRead;
      if (input.isReplied !== undefined) updates.isReplied = input.isReplied;
      await db.update(contactMessages).set(updates).where(eq(contactMessages.id, input.id));
      return { success: true };
    }),

  // ─── SETTINGS MANAGEMENT ───
  settingsUpdate: adminQuery
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(siteSettings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(siteSettings.id, "main"));
      return { success: true };
    }),

  // ─── USERS MANAGEMENT (Super Admin only) ───
  userList: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    }).from(adminUsers);
  }),

  userCreate: adminQuery
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        role: z.enum(["super_admin", "content_manager", "finance", "support"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const hashedPassword = hashSync(input.password, 12);
      await db.insert(adminUsers).values({
        name: input.name,
        email: input.email,
        passwordHash: hashedPassword,
        role: input.role,
      });
      return { success: true };
    }),
});
