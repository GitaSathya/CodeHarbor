import { Document, Analysis, InsertDocument, InsertAnalysis, DocumentStats, MatchResult } from "@shared/schema";

// Simple in-memory storage for development
class InMemoryStorage {
  private documents: Map<string, Document> = new Map();
  private analyses: Map<string, Analysis> = new Map();
  private nextId = 1;

  private generateId(): string {
    return `id_${this.nextId++}_${Date.now()}`;
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.generateId(),
      name: data.name,
      type: data.type,
      content: data.content,
      status: 'completed',
      jobDescriptionId: data.jobDescriptionId || null,
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    this.documents.set(document.id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    const now = new Date();
    const documents = Array.from(this.documents.values());
    
    // Filter out expired job descriptions (older than 90 days)
    const activeDocuments = documents.filter(doc => {
      if (doc.type === 'job_description') {
        const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
        const daysSinceUpload = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpload <= 90; // Keep jobs for 90 days
      }
      return true; // Keep all other document types
    });
    
    return activeDocuments.sort((a, b) => 
      (b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0) - (a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0)
    );
  }

  async getDocumentsByJob(jobDescriptionId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.jobDescriptionId === jobDescriptionId && doc.type === 'consultant_profile')
      .sort((a, b) => (b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0) - (a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0));
  }

  async updateDocumentStatus(id: string, status: string): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.status = status;
      this.documents.set(id, document);
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async createAnalysis(data: InsertAnalysis): Promise<Analysis> {
    const analysis: Analysis = {
      id: this.generateId(),
      jobDescriptionId: data.jobDescriptionId,
      jobTitle: data.jobTitle,
      status: 'processing',
      results: [],
      createdAt: new Date(),
    };

    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    );
  }

  async getAnalysis(analysisId: string): Promise<Analysis | null> {
    return this.analyses.get(analysisId) || null;
  }

  async updateAnalysisStatus(id: string, status: string, results?: MatchResult[]): Promise<void> {
    const analysis = this.analyses.get(id);
    if (analysis) {
      analysis.status = status;
      if (results) {
        analysis.results = results;
      }
      this.analyses.set(id, analysis);
    }
  }

  async getStats(): Promise<DocumentStats> {
    const now = new Date();
    const documents = Array.from(this.documents.values());
    
    // Filter active documents (excluding expired job descriptions)
    const activeDocuments = documents.filter(doc => {
      if (doc.type === 'job_description') {
        const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
        const daysSinceUpload = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpload <= 90;
      }
      return true;
    });
    
    const totalDocuments = activeDocuments.length;
    const activeJobs = activeDocuments
      .filter(doc => doc.type === 'job_description' && doc.status === 'completed').length;
    const processing = activeDocuments
      .filter(doc => doc.status === 'processing').length;
    
    const matchesFound = Array.from(this.analyses.values())
      .filter(analysis => analysis.status === 'completed')
      .reduce((total, analysis) => {
        if (analysis.results && Array.isArray(analysis.results)) {
          return total + analysis.results.length;
        }
        return total;
      }, 0);

    return {
      totalDocuments,
      activeJobs,
      matchesFound,
      processing,
    };
  }

  // Get expired job descriptions for analytics
  async getExpiredJobs(): Promise<Document[]> {
    const now = new Date();
    return Array.from(this.documents.values())
      .filter(doc => {
        if (doc.type === 'job_description') {
          const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
          const daysSinceUpload = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceUpload > 90;
        }
        return false;
      })
      .sort((a, b) => 
        (b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0) - (a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0)
      );
  }

  // Helper method to clear all data (useful for testing)
  async clearAll(): Promise<void> {
    this.documents.clear();
    this.analyses.clear();
    this.nextId = 1;
  }

  // Helper method to add sample data for testing
  async addSampleData(): Promise<void> {
    // Add a sample job description
    await this.createDocument({
      name: "Sample Software Engineer Job",
      type: "job_description",
      content: `Software Engineer Position

We are looking for a talented Software Engineer to join our team.

Requirements:
- 3+ years of experience in software development
- Proficiency in JavaScript, Python, or Java
- Experience with web technologies (React, Node.js)
- Knowledge of databases and APIs
- Strong problem-solving skills
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Troubleshoot and debug issues

This is a great opportunity for someone who is passionate about technology and wants to work on innovative projects.`,
    });

    // Add a sample candidate profile
    await this.createDocument({
      name: "Sample Developer Resume",
      type: "consultant_profile",
      content: `John Doe - Software Developer

EXPERIENCE
Senior Developer, Tech Corp (2020-Present)
- Developed full-stack web applications using React and Node.js
- Led a team of 3 developers on multiple projects
- Implemented CI/CD pipelines and automated testing
- Reduced application load time by 40%

Software Engineer, Startup Inc (2018-2020)
- Built RESTful APIs and microservices
- Worked with PostgreSQL and MongoDB databases
- Collaborated with product managers and designers
- Participated in agile development processes

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018

SKILLS
- Programming: JavaScript, Python, Java, TypeScript
- Frontend: React, Vue.js, HTML5, CSS3
- Backend: Node.js, Express, Django, Spring Boot
- Databases: PostgreSQL, MongoDB, Redis
- Tools: Git, Docker, AWS, Jenkins
- Other: REST APIs, GraphQL, Microservices, Agile`,
      jobDescriptionId: "id_1_1", // Reference to the sample job
    });
  }
}

export const storage = new InMemoryStorage();

// Initialize with sample data when the server starts
storage.addSampleData().catch(console.error);