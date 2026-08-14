CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"broker" text,
	"account_type" text DEFAULT 'live' NOT NULL,
	"base_currency" text DEFAULT 'USD' NOT NULL,
	"initial_balance" numeric(18, 4) DEFAULT '0' NOT NULL,
	"cost_basis_method" text DEFAULT 'fifo' NOT NULL,
	"sync_source" text DEFAULT 'csv' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"account_id" uuid NOT NULL,
	"trade_date" date NOT NULL,
	"total_trades" integer DEFAULT 0 NOT NULL,
	"winners" integer DEFAULT 0 NOT NULL,
	"losers" integer DEFAULT 0 NOT NULL,
	"breakeven" integer DEFAULT 0 NOT NULL,
	"gross_pnl" numeric(18, 4) DEFAULT '0' NOT NULL,
	"commissions" numeric(18, 4) DEFAULT '0' NOT NULL,
	"net_pnl" numeric(18, 4) DEFAULT '0' NOT NULL,
	"volume" numeric(18, 8) DEFAULT '0' NOT NULL,
	"win_rate" numeric(6, 2),
	"profit_factor" numeric(12, 2),
	"daily_score" integer,
	"checklist_total" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"trade_id" uuid,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"executed_at" timestamp with time zone NOT NULL,
	"commission" numeric(18, 4) DEFAULT '0' NOT NULL,
	"fee" numeric(18, 4) DEFAULT '0' NOT NULL,
	"swap" numeric(18, 4) DEFAULT '0' NOT NULL,
	"order_id" text,
	"external_id" text,
	"import_batch_id" uuid
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"source" text NOT NULL,
	"file_name" text,
	"row_count" integer DEFAULT 0 NOT NULL,
	"inserted" integer DEFAULT 0 NOT NULL,
	"skipped_duplicate" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_log" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"symbol" text NOT NULL,
	"display_name" text,
	"instrument_type" text NOT NULL,
	"contract_multiplier" numeric(18, 8) DEFAULT '1' NOT NULL,
	"pip_size" numeric(20, 8) DEFAULT '0.0001' NOT NULL,
	"canonical_symbol" text
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"direction" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"result" text,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"duration_sec" integer,
	"trade_date" date NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"avg_entry_price" numeric(20, 8) NOT NULL,
	"avg_exit_price" numeric(20, 8),
	"gross_pnl" numeric(18, 4) DEFAULT '0' NOT NULL,
	"commissions" numeric(18, 4) DEFAULT '0' NOT NULL,
	"swap" numeric(18, 4) DEFAULT '0' NOT NULL,
	"net_pnl" numeric(18, 4) DEFAULT '0' NOT NULL,
	"adjusted_cost" numeric(18, 4),
	"net_roi" numeric(12, 6),
	"pips" numeric(14, 2),
	"stop_loss_price" numeric(20, 8),
	"target_price" numeric(20, 8),
	"trade_risk" numeric(18, 4),
	"initial_target" numeric(18, 4),
	"planned_r" numeric(10, 2),
	"realized_r" numeric(10, 2),
	"mae_price" numeric(20, 8),
	"mfe_price" numeric(20, 8),
	"strategy_id" uuid,
	"rating" integer,
	"ai_scale" numeric(6, 2),
	"ai_insight" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by" uuid,
	"user_agent" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"nickname" text NOT NULL,
	"avatar_url" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'Asia/Shanghai' NOT NULL,
	"locale" text DEFAULT 'zh-CN' NOT NULL,
	"display_currency" text DEFAULT 'USD' NOT NULL,
	"date_format" text DEFAULT 'YYYY-MM-DD' NOT NULL,
	"ui_prefs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stats_pk" ON "daily_stats" USING btree ("account_id","trade_date");--> statement-breakpoint
CREATE UNIQUE INDEX "executions_account_external_idx" ON "executions" USING btree ("account_id","external_id");--> statement-breakpoint
CREATE INDEX "executions_account_symbol_time_idx" ON "executions" USING btree ("account_id","symbol","executed_at");--> statement-breakpoint
CREATE INDEX "executions_trade_idx" ON "executions" USING btree ("trade_id");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_user_symbol_idx" ON "instruments" USING btree ("user_id","symbol");--> statement-breakpoint
CREATE INDEX "trades_account_opened_idx" ON "trades" USING btree ("account_id","opened_at");--> statement-breakpoint
CREATE INDEX "trades_account_date_idx" ON "trades" USING btree ("account_id","trade_date");--> statement-breakpoint
CREATE INDEX "trades_symbol_idx" ON "trades" USING btree ("account_id","symbol");--> statement-breakpoint
CREATE INDEX "trades_open_idx" ON "trades" USING btree ("account_id") WHERE status = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_hash_idx" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_identities_provider_uid_idx" ON "user_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "user_identities_user_idx" ON "user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_idx" ON "users" USING btree (lower("email"));