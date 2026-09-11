CREATE TABLE `admin_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('super_admin','content_manager','finance','support') NOT NULL DEFAULT 'support',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`certificate_number` varchar(50) NOT NULL,
	`student_name` varchar(255) NOT NULL,
	`course_name` varchar(255) NOT NULL,
	`completion_date` date NOT NULL,
	`enrollment_id` int,
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	`is_valid` boolean NOT NULL DEFAULT true,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificate_number_unique` UNIQUE(`certificate_number`),
	CONSTRAINT `certificates_number_idx` UNIQUE(`certificate_number`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`is_replied` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('languages','bakery','salon','mechanics','ai_skills','private_candidate') NOT NULL,
	`language_sub_type` enum('conversational','test_prep'),
	`language` varchar(50),
	`exam_name` varchar(50),
	`short_desc` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`what_youll_learn` text,
	`who_is_it_for` text,
	`modules` text,
	`requirements` text,
	`career_outcomes` text,
	`duration` varchar(50) NOT NULL,
	`schedule_options` text,
	`next_intake` date,
	`fee_rwf` int,
	`installment_available` boolean DEFAULT false,
	`image_url` text,
	`is_featured` boolean DEFAULT false,
	`is_published` boolean DEFAULT true,
	`display_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reference_number` varchar(50) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50) NOT NULL,
	`whatsapp` varchar(50),
	`date_of_birth` date,
	`gender` varchar(20),
	`nationality` varchar(100),
	`national_id` varchar(100),
	`district` varchar(100),
	`course_id` int NOT NULL,
	`language_option` varchar(50),
	`language_level` varchar(50),
	`exam_option` varchar(50),
	`schedule_preference` varchar(50),
	`preferred_start_date` date,
	`referral_source` varchar(100),
	`education_level` varchar(100),
	`occupation` varchar(100),
	`special_needs` text,
	`emergency_name` varchar(255),
	`emergency_phone` varchar(50),
	`emergency_relation` varchar(50),
	`status` enum('pending','under_review','enrolled','rejected','waitlisted','completed') NOT NULL DEFAULT 'pending',
	`payment_status` enum('not_paid','partially_paid','fully_paid') NOT NULL DEFAULT 'not_paid',
	`admin_notes` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrollments_reference_number_unique` UNIQUE(`reference_number`),
	CONSTRAINT `enrollments_reference_idx` UNIQUE(`reference_number`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`category` enum('enrollment','courses','fees','schedule','certificates','technical') NOT NULL,
	`display_order` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`image_url` text NOT NULL,
	`thumbnail_url` text,
	`caption` varchar(255),
	`category` enum('graduation','classes','bakery','salon','mechanics','events','campus') NOT NULL,
	`display_order` int DEFAULT 0,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`department` enum('languages','bakery','salon','mechanics','ai_skills','private_candidate') NOT NULL,
	`bio` text NOT NULL,
	`photo_url` text,
	`email` varchar(255),
	`linkedin_url` text,
	`qualifications` text,
	`specializations` text,
	`is_leadership` boolean DEFAULT false,
	`display_order` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instructors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('news','event','achievement','announcement') NOT NULL,
	`thumbnail_url` text,
	`excerpt` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`author_name` varchar(255) NOT NULL,
	`event_date` date,
	`event_location` varchar(255),
	`is_published` boolean DEFAULT false,
	`published_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reference_number` varchar(50) NOT NULL,
	`enrollment_ref` varchar(50),
	`provider` enum('MOMO','AIRTEL') NOT NULL,
	`amount` int NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`status` enum('pending','success','failed','cancelled') NOT NULL DEFAULT 'pending',
	`transaction_id` varchar(100),
	`initiated_at` timestamp NOT NULL DEFAULT (now()),
	`verified_at` timestamp,
	`admin_notes` text,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_reference_number_unique` UNIQUE(`reference_number`),
	CONSTRAINT `payments_reference_idx` UNIQUE(`reference_number`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` varchar(50) NOT NULL DEFAULT 'main',
	`site_name` varchar(255) DEFAULT 'Pacemaker Institute',
	`tagline` varchar(255),
	`phone` varchar(50),
	`email` varchar(255),
	`whatsapp` varchar(50),
	`address` text,
	`maps_embed_url` text,
	`opening_hours` text,
	`announcement_active` boolean DEFAULT false,
	`announcement_messages` text,
	`next_intake_date` date,
	`enrollment_deadline` date,
	`enrollment_open` boolean DEFAULT true,
	`academic_calendar` text,
	`facebook_url` text,
	`instagram_url` text,
	`twitter_url` text,
	`linkedin_url` text,
	`youtube_url` text,
	`tiktok_url` text,
	`email_from_name` varchar(255) DEFAULT 'Pacemaker Institute',
	`email_reply_to` varchar(255),
	`seo_title_suffix` varchar(255) DEFAULT '| Pacemaker Institute Kigali',
	`seo_default_desc` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`student_name` varchar(255) NOT NULL,
	`photo_url` text,
	`linkedin_url` text,
	`course_id` int,
	`course_name` varchar(255),
	`completion_year` int,
	`current_role` varchar(255),
	`employer` varchar(255),
	`quote` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`is_featured` boolean DEFAULT false,
	`is_approved` boolean DEFAULT false,
	`is_published` boolean DEFAULT false,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `contact_messages_is_read_idx` ON `contact_messages` (`is_read`);--> statement-breakpoint
CREATE INDEX `courses_category_published_idx` ON `courses` (`category`,`is_published`);--> statement-breakpoint
CREATE INDEX `courses_featured_published_idx` ON `courses` (`is_featured`,`is_published`);--> statement-breakpoint
CREATE INDEX `enrollments_status_idx` ON `enrollments` (`status`);--> statement-breakpoint
CREATE INDEX `enrollments_email_idx` ON `enrollments` (`email`);--> statement-breakpoint
CREATE INDEX `enrollments_course_idx` ON `enrollments` (`course_id`);--> statement-breakpoint
CREATE INDEX `faqs_published_category_idx` ON `faqs` (`is_published`,`category`);--> statement-breakpoint
CREATE INDEX `news_published_category_idx` ON `news_events` (`is_published`,`category`);--> statement-breakpoint
CREATE INDEX `payments_enrollment_ref_idx` ON `payments` (`enrollment_ref`);--> statement-breakpoint
CREATE INDEX `payments_phone_idx` ON `payments` (`phone_number`);--> statement-breakpoint
CREATE INDEX `payments_transaction_id_idx` ON `payments` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `testimonials_published_featured_idx` ON `testimonials` (`is_published`,`is_approved`,`is_featured`);