CREATE TABLE `counters` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`interest` text NOT NULL,
	`message` text NOT NULL,
	`transcript` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`mail_status` text DEFAULT 'pending' NOT NULL,
	`provider_id` text,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`history` text NOT NULL,
	`expires` integer NOT NULL,
	`busy_until` integer DEFAULT 0 NOT NULL
);
