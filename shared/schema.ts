
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'job_description' | 'consultant_profile'
  content: text("content").notNull(),
  status: text("status").notNull().default('processing'), // 'processing' | 'completed' | 'failed'
  jobDescriptionId: varchar("job_description_id"), // For linking applicant profiles to job descriptions
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobDescriptionId: varchar("job_description_id").notNull(),
  jobTitle: text("job_title").notNull(),
  status: text("status").notNull().default('processing'), // 'processing' | 'completed' | 'failed'
  results: jsonb("results"), // Array of match results
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  type: true,
  content: true,
  jobDescriptionId: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  jobDescriptionId: true,
  jobTitle: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export interface DocumentStats {
  totalDocuments: number;
  activeJobs: number;
  matchesFound: number;
  processing: number;
}

export interface MatchResult {
  consultantId: string;
  consultantName: string;
  role?: string;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  contextMatch: number;
  matchedSkills: string[];
  experienceYears: string;
  summary: string;
  status: 'shortlisted' | 'rejected' | 'pending'; // New status field
}
