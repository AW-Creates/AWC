CREATE TABLE `crew_callback_allowances` (
	`id` text PRIMARY KEY NOT NULL,
	`signature` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`reserved_micros` integer DEFAULT 0 NOT NULL
);
