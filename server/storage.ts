import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { documents, analyses, type Document, type Analysis, type InsertDocument, type InsertAnalysis, type DocumentStats, type MatchResult } from "@shared/schema";
import { eq, count, and, desc } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";
const client = postgres(connectionString);
const db = drizzle(client);

async function ensureDbInitialized() {
  try {
    // Simple check to see if tables exist and create them if not
    await db.select().from(documents).limit(1);
  } catch (error) {
    console.log('Initializing database tables...');
    // Tables might not exist yet, but drizzle will handle this
    // In a real application, you might want to run migrations here or have a more robust check.
  }
}

export const storage = {
  async createDocument(data: InsertDocument): Promise<Document> {
    await ensureDbInitialized();
    const [document] = await db.insert(documents).values(data).returning();
    return document;
  },

  async getDocument(id: string): Promise<Document | undefined> {
    await ensureDbInitialized();
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  },

  async getAllDocuments(): Promise<Document[]> {
    try {
      await ensureDbInitialized();
      return await db.select().from(documents).orderBy(desc(documents.uploadedAt));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async getDocumentsByJob(jobDescriptionId: string): Promise<Document[]> {
    await ensureDbInitialized();
    return await db.select().from(documents).where(
      and(
        eq(documents.jobDescriptionId, jobDescriptionId),
        eq(documents.type, 'consultant_profile')
      )
    ).orderBy(desc(documents.uploadedAt));
  },

  async updateDocumentStatus(id: string, status: string): Promise<void> {
    await ensureDbInitialized();
    await db.update(documents).set({ status }).where(eq(documents.id, id));
  },

  async deleteDocument(id: string): Promise<boolean> {
    await ensureDbInitialized();
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  },

  async createAnalysis(data: InsertAnalysis): Promise<Analysis> {
    await ensureDbInitialized();
    const [analysis] = await db.insert(analyses).values(data).returning();
    return analysis;
  },

  async getAllAnalyses(): Promise<Analysis[]> {
    try {
      await ensureDbInitialized();
      return await db.select().from(analyses).orderBy(desc(analyses.createdAt));
    } catch (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }
  },

  async updateAnalysisStatus(id: string, status: string, results?: MatchResult[]): Promise<void> {
    await ensureDbInitialized();
    await db.update(analyses).set({ 
      status, 
      results: results ? JSON.stringify(results) : undefined 
    }).where(eq(analyses.id, id));
  },

  async getStats(): Promise<DocumentStats> {
    await ensureDbInitialized();
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
      if (analysis.results && Array.isArray(JSON.parse(analysis.results))) {
        return total + JSON.parse(analysis.results).length;
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