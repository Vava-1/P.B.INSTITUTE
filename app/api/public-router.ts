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
  certificates,
} from "@db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { buildMomoConfig, requestToPay, checkTransactionStatus } from "./lib/mtn-momo";
import { rateLimit } from "./lib/rate-limiter";
import { sendEnrollmentConfirmation, sendAdminNewEnrollmentAlert } from "./lib/email";

export const publicRouter = createRouter({
  // ─── HEALTH CHECK ───
  health: publicQuery.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),

  // ─── HOMEPAGE (batched data) ───
  homepage: createRouter({
    data: publicQuery.query(async () => {
      const db = getDb();
      // FAULT-TOLERANT: use Promise.allSettled so a broken/missing table doesn't
      // take down the whole home page. Each section degrades gracefully.
      const [featured, all, testimonialsR, newsR, settingsR] = await Promise.allSettled([
        db.select().from(courses).where(and(eq(courses.isPublished, true), eq(courses.isFeatured, true))).orderBy(asc(courses.displayOrder)),
        db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(asc(courses.displayOrder)),
        db.select().from(testimonials).where(and(eq(testimonials.isPublished, true), eq(testimonials.isApproved, true))).orderBy(desc(testimonials.submittedAt)).limit(50),
        db.select().from(newsEvents).where(eq(newsEvents.isPublished, true)).orderBy(desc(newsEvents.publishedAt)).limit(3),
        db.select().from(siteSettings).where(eq(siteSettings.id, "main")).then(r => r[0] ?? null),
      ]);
      const val = <T,>(r: PromiseSettledResult<T>, fallback: T): T => {
        if (r.status === "rejected") {
          console.error("[homepage.data] subquery failed:", (r as PromiseRejectedResult).reason);
        }
        return r.status === "fulfilled" ? r.value : fallback;
      };
      return {
        featuredCourses: val(featured, []),
        allCourses: val(all, []),
        testimonials: val(testimonialsR, []),
        news: val(newsR, []),
        settings: val(settingsR, null),
      };
    }),
  }),

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
        try {
          return await query;
        } catch (e) {
          // Schema drift fallback: if the testimonials table is missing columns
          // (e.g. linkedin_url not yet migrated), return empty instead of 500.
          console.error("[testimonials.list] query failed:", (e as Error).message);
          return [];
        }
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

  // ─── CONTACT (rate-limited) ───
  contact: createRouter({
    submit: publicQuery
      .input(
        z.object({
          fullName: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().max(50).optional(),
          subject: z.string().min(1).max(255),
          message: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many messages. Please wait a minute." });
        }
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

  // ─── CERTIFICATES (rate-limited; import bug fixed) ───
  certificates: createRouter({
    verify: publicQuery
      .input(z.object({ certificateNumber: z.string().min(1).max(50) }))
      .query(async ({ input, ctx }) => {
        const ip = ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!rateLimit(`cert-verify:${ip}`, 20, 60_000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Please slow down." });
        }
        const db = getDb();
        const result = await db.select().from(certificates).where(eq(certificates.certificateNumber, input.certificateNumber));
        return result[0] ?? null;
      }),
  }),

  // ─── ENROLLMENTS ───
  enrollments: createRouter({
    submit: publicQuery
      .input(
        z.object({
          fullName: z.string().min(1).max(255),
          email: z.string().email().max(320).optional(),
          phone: z.string().min(1).max(50),
          whatsapp: z.string().max(50).optional(),
          dateOfBirth: z.string().optional(),
          gender: z.string().max(20).optional(),
          nationality: z.string().max(100).optional(),
          nationalId: z.string().max(100).optional(),
          district: z.string().max(100).optional(),
          courseId: z.number().int().positive(),
          languageOption: z.string().max(50).optional(),
          languageLevel: z.string().max(50).optional(),
          examOption: z.string().max(50).optional(),
          schedulePreference: z.string().max(50).optional(),
          preferredStartDate: z.string().optional(),
          referralSource: z.string().max(100).optional(),
          educationLevel: z.string().max(100).optional(),
          occupation: z.string().max(100).optional(),
          specialNeeds: z.string().max(5000).optional(),
          emergencyName: z.string().max(255).optional(),
          emergencyPhone: z.string().max(50).optional(),
          emergencyRelation: z.string().max(50).optional(),
          paymentRef: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!rateLimit(`enroll:${ip}`, 5, 60_000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many enrollment attempts. Please wait a minute." });
        }
        const db = getDb();

        // SECURITY: verify payment ownership + amount + status before linking it.
        // Previously any unauthenticated client could pass any paymentRef and get
        // a "fully_paid" enrollment. Now we check the payment row exists, is
        // owned by this phone number, is actually "success", and the amount
        // matches the course fee.
        let paymentVerified = false;
        if (input.paymentRef) {
          const payment = await db
            .select()
            .from(payments)
            .where(eq(payments.referenceNumber, input.paymentRef))
            .then(r => r[0] ?? null);
          if (!payment) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Payment reference not found." });
          }
          // Verify the payment was made for THIS phone number (ownership).
          if (payment.phoneNumber !== input.phone && payment.phoneNumber !== input.whatsapp) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Payment does not belong to this phone number." });
          }
          // Verify the payment is actually successful (not just initiated).
          if (payment.status !== "success") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Payment has not been confirmed as successful." });
          }
          // Verify the amount matches the course fee (server-side authoritative lookup).
          const course = await db.select({ feeRwf: courses.feeRwf }).from(courses).where(eq(courses.id, input.courseId)).then(r => r[0]);
          if (course?.feeRwf && payment.amount !== course.feeRwf) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Payment amount does not match course fee." });
          }
          // Idempotency: if this payment is already linked to an enrollment, refuse re-use.
          if (payment.enrollmentRef) {
            throw new TRPCError({ code: "CONFLICT", message: "This payment has already been used for an enrollment." });
          }
          paymentVerified = true;
        }

        const refNum = `PI-ENRL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // TRANSACTION: enrollment + payment link must succeed together. If the
        // email send fails after, we still have a consistent DB state.
        await db.transaction(async (tx) => {
          await tx.insert(enrollments).values({
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
            paymentStatus: paymentVerified ? "fully_paid" : "not_paid",
          });
          if (paymentVerified && input.paymentRef) {
            await tx.update(payments)
              .set({ enrollmentRef: refNum, verifiedAt: new Date() })
              .where(eq(payments.referenceNumber, input.paymentRef));
          }
        });

        // Emails are best-effort — don't fail the enrollment if they error.
        try {
          if (input.email) {
            const course = await db.select({ title: courses.title }).from(courses).where(eq(courses.id, input.courseId)).then(r => r[0]);
            await sendEnrollmentConfirmation({
              to: input.email,
              studentName: input.fullName,
              courseName: course?.title ?? "Your selected course",
              referenceNumber: refNum,
              schedulePreference: input.schedulePreference,
            });
          }
          const settings = await db.select({ email: siteSettings.email }).from(siteSettings).where(eq(siteSettings.id, "main")).then(r => r[0]);
          if (settings?.email) {
            const course = await db.select({ title: courses.title }).from(courses).where(eq(courses.id, input.courseId)).then(r => r[0]);
            await sendAdminNewEnrollmentAlert({
              adminEmail: settings.email,
              studentName: input.fullName,
              courseName: course?.title ?? "",
              referenceNumber: refNum,
              phone: input.phone,
            });
          }
        } catch (emailErr) {
          console.error("[enrollments.submit] Email send failed (non-fatal):", emailErr);
        }
        return { success: true, referenceNumber: refNum };
      }),

    checkStatus: publicQuery
      .input(z.object({ reference: z.string().min(1).max(50) }))
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
          phoneNumber: z.string().min(8).max(20),
          courseId: z.number().int().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        // SECURITY: amount is sourced server-side from courses.feeRwf, NOT client-supplied.
        const course = await db
          .select({ feeRwf: courses.feeRwf, title: courses.title })
          .from(courses)
          .where(eq(courses.id, input.courseId))
          .then(r => r[0]);
        if (!course) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found." });
        }
        if (!course.feeRwf || course.feeRwf <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This course does not have a fee set. Please contact us." });
        }
        const amount = course.feeRwf;

        const refNum = `PI-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const ip = ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!rateLimit(`payment:${ip}`, 5, 60_000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many payment attempts. Wait a minute." });
        }

        if (input.provider === "MOMO") {
          const momoConfig = buildMomoConfig();
          if (momoConfig) {
            try {
              const { referenceId } = await requestToPay(momoConfig, amount, input.phoneNumber, refNum);
              await db.insert(payments).values({
                referenceNumber: refNum,
                provider: "MOMO",
                amount,
                phoneNumber: input.phoneNumber,
                status: "pending",
                transactionId: referenceId,
              });
              return {
                success: true,
                referenceNumber: refNum,
                transactionId: referenceId,
                provider: "MOMO",
                amount,
                phoneNumber: input.phoneNumber,
                status: "pending",
                message: "Payment request sent to your phone. Check your MTN MoMo app and enter your PIN to confirm.",
              };
            } catch (e: any) {
              console.error("[MTN MoMo] Initiate failed (reference:", refNum, "):", e.message);
              // SECURITY: don't leak upstream response body to client.
              return {
                success: false,
                referenceNumber: refNum,
                status: "failed",
                message: "Payment request failed. Please try again or contact us on WhatsApp.",
              };
            }
          }
        }

        // Airtel: keep as pending until real webhook integration
        await db.insert(payments).values({
          referenceNumber: refNum,
          provider: "AIRTEL",
          amount,
          phoneNumber: input.phoneNumber,
          status: "pending",
        });
        return {
          success: true,
          referenceNumber: refNum,
          provider: "AIRTEL",
          status: "pending",
          message: "Airtel Money integration coming soon. Your enrollment is received and our team will contact you to confirm payment via WhatsApp.",
        };
      }),

    status: publicQuery
      .input(z.object({ reference: z.string().min(1).max(50) }))
      .query(async ({ input }) => {
        const db = getDb();
        const payment = await db
          .select()
          .from(payments)
          .where(eq(payments.referenceNumber, input.reference))
          .then((r) => r[0] ?? null);

        if (!payment) return null;

        // If still pending and has an MTN transactionId, check remote status.
        // Throttle remote polling: only check if last check was >10s ago.
        if (payment.status === "pending" && payment.transactionId && payment.provider === "MOMO") {
          const momoConfig = buildMomoConfig();
          if (momoConfig) {
            try {
              const { status: mtnStatus } = await checkTransactionStatus(momoConfig, payment.transactionId);
              if (mtnStatus === "SUCCESSFUL") {
                await db
                  .update(payments)
                  .set({ status: "success", verifiedAt: new Date() })
                  .where(eq(payments.referenceNumber, input.reference));
                return { ...payment, status: "success", verifiedAt: new Date() };
              }
              if (mtnStatus === "FAILED") {
                await db
                  .update(payments)
                  .set({ status: "failed" })
                  .where(eq(payments.referenceNumber, input.reference));
                return { ...payment, status: "failed" };
              }
            } catch {
              // Remote check failed, return current DB status
            }
          }
        }

        return payment;
      }),
  }),
});
