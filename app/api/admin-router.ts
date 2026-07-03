import { z } from "zod";
import { createRouter, adminQuery, superAdminQuery, contentAdminQuery, financeAdminQuery, publicQuery } from "./middleware";
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
import { eq, desc, asc, or, like, count, sql } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";
import { signAdminToken } from "./lib/jwt";
import { rateLimit } from "./lib/rate-limiter";
import { TRPCError } from "@trpc/server";

// ─── Explicit Zod schemas (no z.record(z.any()) mass-assignment) ───

const courseUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  category: z.enum(["languages", "bakery", "salon", "mechanics", "ai_skills", "private_candidate"]).optional(),
  languageSubType: z.enum(["conversational", "test_prep"]).optional().nullable(),
  language: z.string().optional().nullable(),
  examName: z.string().optional().nullable(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  whatYoullLearn: z.string().optional().nullable(),
  whoIsItFor: z.string().optional().nullable(),
  modules: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  careerOutcomes: z.string().optional().nullable(),
  duration: z.string().optional(),
  scheduleOptions: z.string().optional().nullable(),
  nextIntake: z.string().optional().nullable(),
  feeRwf: z.number().int().nonnegative().optional().nullable(),
  installmentAvailable: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const newsUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  category: z.enum(["news", "event", "achievement", "announcement"]).optional(),
  thumbnailUrl: z.string().optional().nullable(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  authorName: z.string().optional(),
  eventDate: z.string().optional().nullable(),
  eventLocation: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
});

const testimonialUpdateSchema = z.object({
  studentName: z.string().min(1).optional(),
  photoUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  courseId: z.number().optional().nullable(),
  courseName: z.string().optional().nullable(),
  completionYear: z.number().int().optional().nullable(),
  currentRole: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
  quote: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isFeatured: z.boolean().optional(),
  isApproved: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const settingsUpdateSchema = z.object({
  siteName: z.string().optional(),
  tagline: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  mapsEmbedUrl: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  announcementActive: z.boolean().optional(),
  announcementMessages: z.string().optional().nullable(),
  nextIntakeDate: z.string().optional().nullable(),
  enrollmentDeadline: z.string().optional().nullable(),
  enrollmentOpen: z.boolean().optional(),
  academicCalendar: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  tiktokUrl: z.string().optional().nullable(),
  emailFromName: z.string().optional(),
  emailReplyTo: z.string().optional().nullable(),
  seoTitleSuffix: z.string().optional(),
  seoDefaultDesc: z.string().optional().nullable(),
});

export const adminRouter = createRouter({
  // ─── LOGIN (Public - used for admin login, but rate-limited) ───
  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 10 attempts per 15 min per IP to slow brute force.
      const ip = ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      if (!rateLimit(`admin-login:${ip}`, 10, 15 * 60_000)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." });
      }
      const db = getDb();
      const result = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, input.email));
      const user = result[0];
      if (!user || !user.isActive) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      const valid = compareSync(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      await db
        .update(adminUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(adminUsers.id, user.id));
      const token = await signAdminToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };
    }),

  // ─── DASHBOARD STATS ───
  stats: adminQuery.query(async () => {
    const db = getDb();
    // Run all 6 counts in parallel via Promise.all (was sequential).
    const [
      enrollmentCount,
      pendingCount,
      enrolledCount,
      messageCount,
      courseCount,
      testimonialCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(enrollments),
      db.select({ count: count() }).from(enrollments).where(eq(enrollments.status, "pending")),
      db.select({ count: count() }).from(enrollments).where(eq(enrollments.status, "enrolled")),
      db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
      db.select({ count: count() }).from(courses),
      db.select({ count: count() }).from(testimonials),
    ]);

    return {
      totalEnrollments: enrollmentCount[0].count,
      pendingEnrollments: pendingCount[0].count,
      confirmedEnrollments: enrolledCount[0].count,
      unreadMessages: messageCount[0].count,
      totalCourses: courseCount[0].count,
      totalTestimonials: testimonialCount[0].count,
    };
  }),

  // ─── ENROLLMENTS MANAGEMENT (finance + super_admin) ───
  enrollmentList: financeAdminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(enrollments.fullName, `%${input.search}%`),
            like(enrollments.email, `%${input.search}%`),
            like(enrollments.referenceNumber, `%${input.search}%`)
          )
        );
      }
      if (input?.status) {
        conditions.push(eq(enrollments.status, input.status as any));
      }
      const query = db
        .select()
        .from(enrollments)
        .orderBy(desc(enrollments.submittedAt))
        .limit(limit)
        .offset(offset);
      return conditions.length > 0 ? query.where(conditions.length === 1 ? conditions[0]! : sql`${conditions[0]}`) : query;
    }),

  enrollmentUpdate: financeAdminQuery
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

  // ─── COURSES MANAGEMENT (content + super_admin) ───
  courseList: contentAdminQuery.query(async () => {
    const db = getDb();
    return db.select().from(courses).orderBy(asc(courses.displayOrder));
  }),

  courseCreate: contentAdminQuery
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

  courseUpdate: contentAdminQuery
    .input(
      z.object({
        id: z.number(),
        data: courseUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Only set fields that are present (z.optional + .partial).
      const data = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined)
      );
      await db.update(courses).set(data).where(eq(courses.id, input.id));
      return { success: true };
    }),

  courseDelete: superAdminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(courses).where(eq(courses.id, input.id));
      return { success: true };
    }),

  // ─── NEWS MANAGEMENT (content + super_admin) ───
  newsList: contentAdminQuery.query(async () => {
    const db = getDb();
    return db.select().from(newsEvents).orderBy(desc(newsEvents.createdAt));
  }),

  newsCreate: contentAdminQuery
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

  newsUpdate: contentAdminQuery
    .input(
      z.object({
        id: z.number(),
        data: newsUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: any = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined)
      );
      // If toggling to published and no publishedAt, set it.
      if (data.isPublished === true && !data.publishedAt) {
        data.publishedAt = new Date();
      }
      if (data.publishedAt !== undefined && typeof data.publishedAt === "string") {
        data.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
      }
      if (data.eventDate !== undefined && typeof data.eventDate === "string") {
        data.eventDate = data.eventDate ? new Date(data.eventDate) : null;
      }
      await db.update(newsEvents).set(data).where(eq(newsEvents.id, input.id));
      return { success: true };
    }),

  newsDelete: superAdminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(newsEvents).where(eq(newsEvents.id, input.id));
      return { success: true };
    }),

  // ─── TESTIMONIALS MANAGEMENT (content + super_admin) ───
  testimonialList: contentAdminQuery.query(async () => {
    const db = getDb();
    return db.select().from(testimonials).orderBy(desc(testimonials.submittedAt));
  }),

  testimonialCreate: contentAdminQuery
    .input(
      z.object({
        studentName: z.string().min(1),
        photoUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        courseId: z.number().optional(),
        courseName: z.string().optional(),
        completionYear: z.number().optional(),
        currentRole: z.string().optional(),
        employer: z.string().optional(),
        quote: z.string().min(1),
        rating: z.number().min(1).max(5).default(5),
        isFeatured: z.boolean().default(false),
        isPublished: z.boolean().default(false),
        isApproved: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(testimonials).values(input);
      return { success: true };
    }),

  testimonialUpdate: contentAdminQuery
    .input(
      z.object({
        id: z.number(),
        data: testimonialUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined)
      );
      await db.update(testimonials).set(data).where(eq(testimonials.id, input.id));
      return { success: true };
    }),

  testimonialDelete: superAdminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(testimonials).where(eq(testimonials.id, input.id));
      return { success: true };
    }),

  // ─── CONTACT MESSAGES (any admin role) ───
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

  // ─── SETTINGS MANAGEMENT (super_admin only) ───
  settingsUpdate: superAdminQuery
    .input(settingsUpdateSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      const data = Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined)
      );
      await db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.id, "main"));
      return { success: true };
    }),

  // ─── USERS MANAGEMENT (super_admin only) ───
  userList: superAdminQuery.query(async () => {
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

  userCreate: superAdminQuery
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
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
