import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  date,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── ADMIN USERS ───
export const adminUsers = mysqlTable("admin_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["super_admin", "content_manager", "finance", "support"])
    .default("support")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

// ─── COURSES ───
export const courses = mysqlTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "languages",
    "bakery",
    "salon",
    "mechanics",
    "ai_skills",
    "private_candidate",
  ]).notNull(),
  languageSubType: mysqlEnum("language_sub_type", ["conversational", "test_prep"]),
  language: varchar("language", { length: 50 }),
  examName: varchar("exam_name", { length: 50 }),
  shortDesc: varchar("short_desc", { length: 200 }).notNull(),
  description: text("description").notNull(),
  whatYoullLearn: text("what_youll_learn"),
  whoIsItFor: text("who_is_it_for"),
  modules: text("modules"),
  requirements: text("requirements"),
  careerOutcomes: text("career_outcomes"),
  duration: varchar("duration", { length: 50 }).notNull(),
  scheduleOptions: text("schedule_options"),
  nextIntake: date("next_intake"),
  feeRwf: int("fee_rwf"),
  installmentAvailable: boolean("installment_available").default(false),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(true),
  displayOrder: int("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  // Index for the public course list filter by category + published.
  categoryPublishedIdx: index("courses_category_published_idx").on(t.category, t.isPublished),
  // Index for "featured courses" homepage query.
  featuredPublishedIdx: index("courses_featured_published_idx").on(t.isFeatured, t.isPublished),
}));

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ─── ENROLLMENTS ───
export const enrollments = mysqlTable("enrollments", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  nationality: varchar("nationality", { length: 100 }),
  nationalId: varchar("national_id", { length: 100 }),
  district: varchar("district", { length: 100 }),
  // FIXED: was bigint joining against int `courses.id`. Now int to match.
  courseId: int("course_id").notNull(),
  languageOption: varchar("language_option", { length: 50 }),
  languageLevel: varchar("language_level", { length: 50 }),
  examOption: varchar("exam_option", { length: 50 }),
  schedulePreference: varchar("schedule_preference", { length: 50 }),
  preferredStartDate: date("preferred_start_date"),
  referralSource: varchar("referral_source", { length: 100 }),
  educationLevel: varchar("education_level", { length: 100 }),
  occupation: varchar("occupation", { length: 100 }),
  specialNeeds: text("special_needs"),
  emergencyName: varchar("emergency_name", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  emergencyRelation: varchar("emergency_relation", { length: 50 }),
  status: mysqlEnum("status", ["pending", "under_review", "enrolled", "rejected", "waitlisted", "completed"])
    .default("pending")
    .notNull(),
  paymentStatus: mysqlEnum("payment_status", ["not_paid", "partially_paid", "fully_paid"])
    .default("not_paid")
    .notNull(),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  // Lookup by reference number (already unique, but explicit for clarity).
  referenceIdx: uniqueIndex("enrollments_reference_idx").on(t.referenceNumber),
  // Status filter used by admin dashboard.
  statusIdx: index("enrollments_status_idx").on(t.status),
  // Email lookup (e.g. "find my enrollment").
  emailIdx: index("enrollments_email_idx").on(t.email),
  // Course join.
  courseIdx: index("enrollments_course_idx").on(t.courseId),
}));

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

// ─── NEWS & EVENTS ───
export const newsEvents = mysqlTable("news_events", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["news", "event", "achievement", "announcement"]).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  excerpt: varchar("excerpt", { length: 300 }).notNull(),
  content: text("content").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  eventDate: date("event_date"),
  eventLocation: varchar("event_location", { length: 255 }),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  publishedCategoryIdx: index("news_published_category_idx").on(t.isPublished, t.category),
}));

export type NewsEvent = typeof newsEvents.$inferSelect;
export type InsertNewsEvent = typeof newsEvents.$inferInsert;

// ─── INSTRUCTORS ───
export const instructors = mysqlTable("instructors", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  department: mysqlEnum("department", [
    "languages",
    "bakery",
    "salon",
    "mechanics",
    "ai_skills",
    "private_candidate",
  ]).notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  email: varchar("email", { length: 255 }),
  linkedinUrl: text("linkedin_url"),
  qualifications: text("qualifications"),
  specializations: text("specializations"),
  isLeadership: boolean("is_leadership").default(false),
  displayOrder: int("display_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = typeof instructors.$inferInsert;

// ─── TESTIMONIALS ───
export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  // FIXED: was bigint; now int to match courses.id.
  courseId: int("course_id"),
  courseName: varchar("course_name", { length: 255 }),
  completionYear: int("completion_year"),
  currentRole: varchar("current_role", { length: 255 }),
  employer: varchar("employer", { length: 255 }),
  quote: text("quote").notNull(),
  rating: int("rating").default(5).notNull(),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(false),
  isPublished: boolean("is_published").default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
  publishedFeaturedIdx: index("testimonials_published_featured_idx").on(t.isPublished, t.isApproved, t.isFeatured),
}));

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ─── GALLERY ───
export const galleryItems = mysqlTable("gallery_items", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: varchar("caption", { length: 255 }),
  category: mysqlEnum("category", [
    "graduation",
    "classes",
    "bakery",
    "salon",
    "mechanics",
    "events",
    "campus",
  ]).notNull(),
  displayOrder: int("display_order").default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

// ─── CONTACT MESSAGES ───
export const contactMessages = mysqlTable("contact_messages", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isReplied: boolean("is_replied").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  // Unread messages counter on admin dashboard.
  isReadIdx: index("contact_messages_is_read_idx").on(t.isRead),
}));

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

// ─── SITE SETTINGS ───
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 50 }).primaryKey().default("main"),
  siteName: varchar("site_name", { length: 255 }).default("Pacemaker Institute"),
  tagline: varchar("tagline", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  address: text("address"),
  mapsEmbedUrl: text("maps_embed_url"),
  openingHours: text("opening_hours"),
  announcementActive: boolean("announcement_active").default(false),
  announcementMessages: text("announcement_messages"),
  nextIntakeDate: date("next_intake_date"),
  enrollmentDeadline: date("enrollment_deadline"),
  enrollmentOpen: boolean("enrollment_open").default(true),
  academicCalendar: text("academic_calendar"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  tiktokUrl: text("tiktok_url"),
  emailFromName: varchar("email_from_name", { length: 255 }).default("Pacemaker Institute"),
  emailReplyTo: varchar("email_reply_to", { length: 255 }),
  seoTitleSuffix: varchar("seo_title_suffix", { length: 255 }).default("| Pacemaker Institute Kigali"),
  seoDefaultDesc: text("seo_default_desc"),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ─── PAYMENTS ───
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 50 }).notNull().unique(),
  enrollmentRef: varchar("enrollment_ref", { length: 50 }),
  provider: mysqlEnum("provider", ["MOMO", "AIRTEL"]).notNull(),
  amount: int("amount").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed", "cancelled"])
    .default("pending")
    .notNull(),
  transactionId: varchar("transaction_id", { length: 100 }),
  initiatedAt: timestamp("initiated_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
}, (t) => ({
  referenceIdx: uniqueIndex("payments_reference_idx").on(t.referenceNumber),
  // Lookup payments by enrollment ref (admin "show payments for enrollment").
  enrollmentRefIdx: index("payments_enrollment_ref_idx").on(t.enrollmentRef),
  // Lookup by phone for ownership verification.
  phoneIdx: index("payments_phone_idx").on(t.phoneNumber),
  transactionIdIdx: index("payments_transaction_id_idx").on(t.transactionId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ─── FAQS ───
export const faqs = mysqlTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: mysqlEnum("category", [
    "enrollment",
    "courses",
    "fees",
    "schedule",
    "certificates",
    "technical",
  ]).notNull(),
  displayOrder: int("display_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  publishedCategoryIdx: index("faqs_published_category_idx").on(t.isPublished, t.category),
}));

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

// ─── USERS (OAuth) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  // FIXED: email is now unique to prevent duplicate OAuth accounts.
  email: varchar("email", { length: 320 }).unique(),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CERTIFICATES ───
export const certificates = mysqlTable("certificates", {
  id: serial("id").primaryKey(),
  certificateNumber: varchar("certificate_number", { length: 50 }).notNull().unique(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  courseName: varchar("course_name", { length: 255 }).notNull(),
  completionDate: date("completion_date").notNull(),
  // FIXED: was bigint; now int to match enrollments.id.
  enrollmentId: int("enrollment_id"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  isValid: boolean("is_valid").default(true).notNull(),
}, (t) => ({
  // Lookup by certificate number (verification flow).
  certificateNumberIdx: uniqueIndex("certificates_number_idx").on(t.certificateNumber),
}));

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
