CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"badge_id" varchar(100) NOT NULL,
	"unlocked_at" timestamp with time zone NOT NULL,
	"progress" double precision DEFAULT 100 NOT NULL,
	CONSTRAINT "chk_achievements_progress" CHECK ("achievements"."progress" >= 0 AND "achievements"."progress" <= 100)
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"category" varchar(100) NOT NULL,
	"monthly_limit" double precision NOT NULL,
	CONSTRAINT "chk_budgets_limit" CHECK ("budgets"."monthly_limit" >= 0)
);
--> statement-breakpoint
CREATE TABLE "custom_books" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(300) NOT NULL,
	"author" varchar(200) NOT NULL,
	"category" varchar(100) DEFAULT 'Philosophy' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_color" varchar(100) DEFAULT 'from-emerald-700 to-indigo-950' NOT NULL,
	"chapters_json" text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"type" varchar(32) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"habit_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"value" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(300) NOT NULL,
	"identity" varchar(300) DEFAULT '' NOT NULL,
	"cue" varchar(300) DEFAULT '' NOT NULL,
	"craving" varchar(300) DEFAULT '' NOT NULL,
	"response" varchar(300) DEFAULT '' NOT NULL,
	"reward" varchar(300) DEFAULT '' NOT NULL,
	"two_minute_rule" varchar(300) DEFAULT '' NOT NULL,
	"category" varchar(100) DEFAULT 'Wisdom' NOT NULL,
	"frequency" varchar(50) DEFAULT 'daily' NOT NULL,
	"target_days_per_week" integer DEFAULT 7 NOT NULL,
	"archived" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "chk_habits_days" CHECK ("habits"."target_days_per_week" >= 1 AND "habits"."target_days_per_week" <= 7)
);
--> statement-breakpoint
CREATE TABLE "hourly_steps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"hour" integer NOT NULL,
	"steps" integer NOT NULL,
	CONSTRAINT "chk_hourly_steps_hour" CHECK ("hourly_steps"."hour" >= 0 AND "hourly_steps"."hour" <= 23),
	CONSTRAINT "chk_hourly_steps_count" CHECK ("hourly_steps"."steps" >= 0)
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(300) DEFAULT '' NOT NULL,
	"content" text NOT NULL,
	"mood" varchar(50),
	"tags_json" text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mood_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"score" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"emotion_tags_json" text DEFAULT '[]' NOT NULL,
	CONSTRAINT "chk_mood_score" CHECK ("mood_logs"."score" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "pomodoro_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"task_title" varchar(300) NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_pomodoro_duration" CHECK ("pomodoro_sessions"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"book_id" varchar(100) NOT NULL,
	"status" varchar(32) DEFAULT 'reading' NOT NULL,
	"current_chapter" integer DEFAULT 0 NOT NULL,
	"current_page" integer DEFAULT 0 NOT NULL,
	"total_chapters" integer DEFAULT 1 NOT NULL,
	"percent" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "chk_reading_progress_percent" CHECK ("reading_progress"."percent" >= 0 AND "reading_progress"."percent" <= 100),
	CONSTRAINT "chk_reading_progress_rating" CHECK ("reading_progress"."rating" >= 0 AND "reading_progress"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"family_id" uuid NOT NULL,
	"device_label" varchar(255) DEFAULT 'Unknown Device' NOT NULL,
	"user_agent" text,
	"ip_hash" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savings_goals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(300) NOT NULL,
	"target_amount" double precision NOT NULL,
	"current_amount" double precision DEFAULT 0 NOT NULL,
	"target_date" varchar(32) DEFAULT '2026-12-31' NOT NULL,
	"color" varchar(32) DEFAULT '#10b981' NOT NULL,
	CONSTRAINT "chk_savings_target" CHECK ("savings_goals"."target_amount" > 0),
	CONSTRAINT "chk_savings_current" CHECK ("savings_goals"."current_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "schedule_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(300) NOT NULL,
	"category" varchar(100) DEFAULT 'Work & Deep Work' NOT NULL,
	"date" varchar(10) NOT NULL,
	"start_time" varchar(10) DEFAULT '09:00' NOT NULL,
	"end_time" varchar(10) DEFAULT '10:00' NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurring_days_json" text DEFAULT '[]' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steps_daily" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"steps" integer NOT NULL,
	"distance_km" double precision NOT NULL,
	"calories" integer NOT NULL,
	"active_minutes" integer NOT NULL,
	CONSTRAINT "chk_steps_daily_non_neg" CHECK ("steps_daily"."steps" >= 0 AND "steps_daily"."distance_km" >= 0 AND "steps_daily"."calories" >= 0 AND "steps_daily"."active_minutes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"type" varchar(20) NOT NULL,
	"amount" double precision NOT NULL,
	"category" varchar(100) NOT NULL,
	"date" varchar(10) NOT NULL,
	"note" varchar(500) DEFAULT '' NOT NULL,
	"payment_method" varchar(100) DEFAULT 'UPI / Digital' NOT NULL,
	CONSTRAINT "chk_transactions_amount" CHECK ("transactions"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "user_book_notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"book_id" varchar(100) NOT NULL,
	"chapter_index" integer NOT NULL,
	"title" varchar(300) NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "chk_user_book_notes_ch_idx" CHECK ("user_book_notes"."chapter_index" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" varchar(100) NOT NULL,
	"avatar" varchar(32) DEFAULT '🧘‍♂️' NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"height_cm" double precision DEFAULT 175 NOT NULL,
	"weight_kg" double precision DEFAULT 70 NOT NULL,
	"step_goal" integer DEFAULT 8000 NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"birth_date" varchar(32),
	"expected_lifespan" integer DEFAULT 80 NOT NULL,
	"language" varchar(20) DEFAULT 'en' NOT NULL,
	"theme" varchar(20) DEFAULT 'dark' NOT NULL,
	CONSTRAINT "chk_user_profile_xp" CHECK ("user_profile"."total_xp" >= 0),
	CONSTRAINT "chk_user_profile_height" CHECK ("user_profile"."height_cm" > 0),
	CONSTRAINT "chk_user_profile_step_goal" CHECK ("user_profile"."step_goal" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtue_ratings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"server_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"date" varchar(10) NOT NULL,
	"honesty" integer DEFAULT 4 NOT NULL,
	"patience" integer DEFAULT 4 NOT NULL,
	"kindness" integer DEFAULT 4 NOT NULL,
	"courage" integer DEFAULT 4 NOT NULL,
	"gratitude" integer DEFAULT 4 NOT NULL,
	"humility" integer DEFAULT 4 NOT NULL,
	"reflection" text DEFAULT '' NOT NULL,
	CONSTRAINT "chk_virtues_range" CHECK (
    "virtue_ratings"."honesty" BETWEEN 1 AND 5 AND
    "virtue_ratings"."patience" BETWEEN 1 AND 5 AND
    "virtue_ratings"."kindness" BETWEEN 1 AND 5 AND
    "virtue_ratings"."courage" BETWEEN 1 AND 5 AND
    "virtue_ratings"."gratitude" BETWEEN 1 AND 5 AND
    "virtue_ratings"."humility" BETWEEN 1 AND 5
  )
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_books" ADD CONSTRAINT "custom_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tokens" ADD CONSTRAINT "email_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hourly_steps" ADD CONSTRAINT "hourly_steps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steps_daily" ADD CONSTRAINT "steps_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_book_notes" ADD CONSTRAINT "user_book_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtue_ratings" ADD CONSTRAINT "virtue_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_achievements_cursor_idx" ON "achievements" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_budgets_cursor_idx" ON "budgets" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_custom_books_cursor_idx" ON "custom_books" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_tokens_hash_idx" ON "email_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "email_tokens_user_type_idx" ON "email_tokens" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "sync_habit_logs_cursor_idx" ON "habit_logs" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_habits_cursor_idx" ON "habits" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_hourly_steps_cursor_idx" ON "hourly_steps" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_journal_entries_cursor_idx" ON "journal_entries" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_mood_logs_cursor_idx" ON "mood_logs" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_pomodoro_sessions_cursor_idx" ON "pomodoro_sessions" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_reading_progress_cursor_idx" ON "reading_progress" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_hash_idx" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_family_idx" ON "refresh_tokens" USING btree ("user_id","family_id");--> statement-breakpoint
CREATE INDEX "sync_savings_goals_cursor_idx" ON "savings_goals" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_schedule_tasks_cursor_idx" ON "schedule_tasks" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_steps_daily_cursor_idx" ON "steps_daily" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_transactions_cursor_idx" ON "transactions" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_user_book_notes_cursor_idx" ON "user_book_notes" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE INDEX "sync_user_profile_cursor_idx" ON "user_profile" USING btree ("user_id","server_updated_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sync_virtue_ratings_cursor_idx" ON "virtue_ratings" USING btree ("user_id","server_updated_at","id");