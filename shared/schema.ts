import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Voice Cloning Schema
export const processVoiceCloning = z.object({
  language: z.enum(["english", "hindi"]),
  referenceText: z.string().optional(),
  generationText: z.string().min(1),
  speed: z.number().min(0.5).max(2).default(1.0),
  audioBase64: z.string(),
});

export type ProcessVoiceCloning = z.infer<typeof processVoiceCloning>;

// Generated Audio Schema
export const audioGeneration = pgTable("audio_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  language: text("language").notNull(),
  referenceText: text("reference_text"),
  generationText: text("generation_text").notNull(),
  audioPath: text("audio_path").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertAudioGenerationSchema = createInsertSchema(audioGeneration).pick({
  userId: true,
  language: true,
  referenceText: true,
  generationText: true,
  audioPath: true,
  createdAt: true,
});

export type InsertAudioGeneration = z.infer<typeof insertAudioGenerationSchema>;
export type AudioGeneration = typeof audioGeneration.$inferSelect;
