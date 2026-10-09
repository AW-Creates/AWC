import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const sessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(), history: text('history').notNull(),
  expires: integer('expires').notNull(), busyUntil: integer('busy_until').notNull().default(0)
});
export const counters = sqliteTable('counters', {
  key: text('key').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull()
});
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(), session: text('session').notNull(), name: text('name').notNull(),
  email: text('email').notNull(), interest: text('interest').notNull(), message: text('message').notNull(),
  transcript: text('transcript').notNull(), created: integer('created').notNull(),
  expires: integer('expires').notNull(), mailStatus: text('mail_status').notNull().default('pending'),
  providerId: text('provider_id'), status: text('status').notNull().default('new')
});

// Immutable finite public callback grants; consumption survives cleanup/restarts.
export const callbackAllowances = sqliteTable('crew_callback_allowances', {
  id: text('id').primaryKey(), signature: text('signature').notNull(),
  count: integer('count').notNull().default(0), reservedMicros: integer('reserved_micros').notNull().default(0)
});
