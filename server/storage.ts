import { type Document, type Analysis, type InsertDocument, type InsertAnalysis, type MatchResult, type DocumentStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  deleteDocument(id: string): Promise<boolean>;
  updateDocumentStatus(id: string, status: string): Promise<void>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
  updateAnalysisStatus(id: string, status: string, matches?: MatchResult[]): Promise<void>;
  
  // Stats
  getStats(): Promise<DocumentStats>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private analyses: Map<string, Analysis>;

  constructor() {
    this.documents = new Map();
    this.analyses = new Map();
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      status: 'processing',
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime()
    );
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async updateDocumentStatus(id: string, status: string): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.status = status;
      this.documents.set(id, document);
    }
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      status: 'processing',
      matches: null,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateAnalysisStatus(id: string, status: string, matches?: MatchResult[]): Promise<void> {
    const analysis = this.analyses.get(id);
    if (analysis) {
      analysis.status = status;
      if (matches) {
        analysis.matches = matches;
      }
      this.analyses.set(id, analysis);
    }
  }

  async getStats(): Promise<DocumentStats> {
    const documents = Array.from(this.documents.values());
    const analyses = Array.from(this.analyses.values());
    
    const totalDocuments = documents.length;
    const activeJobs = documents.filter(d => d.type === 'job_description' && d.status === 'completed').length;
    const processing = documents.filter(d => d.status === 'processing').length + 
                      analyses.filter(a => a.status === 'processing').length;
    
    const matchesFound = analyses
      .filter(a => a.matches)
      .reduce((sum, a) => sum + (Array.isArray(a.matches) ? a.matches.length : 0), 0);

    return {
      totalDocuments,
      activeJobs,
      matchesFound,
      processing,
    };
  }
}

export const storage = new MemStorage();
