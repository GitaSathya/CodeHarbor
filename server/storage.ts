
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { documents, analyses, type Document, type Analysis, type InsertDocument, type InsertAnalysis, type DocumentStats, type MatchResult } from "@shared/schema";
import { eq, count, and } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";
const client = postgres(connectionString);
const db = drizzle(client);

export const storage = {
  async createDocument(data: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(data).returning();
    return document;
  },

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  },

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(documents.uploadedAt);
  },

  async getDocumentsByJob(jobDescriptionId: string): Promise<Document[]> {
    return await db.select().from(documents).where(
      and(
        eq(documents.jobDescriptionId, jobDescriptionId),
        eq(documents.type, 'consultant_profile')
      )
    ).orderBy(documents.uploadedAt);
  },

  async updateDocumentStatus(id: string, status: string): Promise<void> {
    await db.update(documents).set({ status }).where(eq(documents.id, id));
  },

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  },

  async createAnalysis(data: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(data).returning();
    return analysis;
  },

  async getAllAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses).orderBy(analyses.createdAt);
  },

  async updateAnalysisStatus(id: string, status: string, results?: MatchResult[]): Promise<void> {
    await db.update(analyses).set({ 
      status, 
      results: results ? JSON.stringify(results) : undefined 
    }).where(eq(analyses.id, id));
  },

  async getStats(): Promise<DocumentStats> {
    const [totalDocsResult] = await db.select({ count: count() }).from(documents);
    const [activeJobsResult] = await db.select({ count: count() }).from(documents).where(
      and(
        eq(documents.type, 'job_description'),
        eq(documents.status, 'completed')
      )
    );
    const [processingResult] = await db.select({ count: count() }).from(documents).where(
      eq(documents.status, 'processing')
    );

    // Count total matches across all analyses
    const allAnalyses = await db.select().from(analyses).where(eq(analyses.status, 'completed'));
    const matchesFound = allAnalyses.reduce((total, analysis) => {
      if (analysis.results && Array.isArray(analysis.results)) {
        return total + analysis.results.length;
      }
      return total;
    }, 0);

    return {
      totalDocuments: totalDocsResult.count,
      activeJobs: activeJobsResult.count,
      matchesFound,
      processing: processingResult.count,
    };
  },
};
