import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  gender: text("gender").notNull(), // 'Male' | 'Female'
  interestedIn: text("interested_in").notNull(), // 'Male' | 'Female'
  age: integer("age").notNull(),
  city: text("city").notNull(),
  bio: text("bio").notNull().default(""),
  profileImage: text("profile_image").notNull(),
  loginType: text("login_type").notNull(), // 'gmail' | 'instagram'
  usernameOrEmail: text("username_or_email").notNull().unique(),
  password: text("password").notNull(),
  interests: text("interests").array().notNull().default([]),
  verified: boolean("verified").notNull().default(false),
  isOnline: boolean("is_online").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
