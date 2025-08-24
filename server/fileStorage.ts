import { Document, Analysis, InsertDocument, InsertAnalysis, DocumentStats, MatchResult } from "@shared/schema";
import { promises as fs } from 'fs';
import path from 'path';

// File-based storage for development with persistence
class FileStorage {
  private dataDir = path.join(process.cwd(), 'data');
  private documentsFile = path.join(this.dataDir, 'documents.json');
  private analysesFile = path.join(this.dataDir, 'analyses.json');
  private documents: Map<string, Document> = new Map();
  private analyses: Map<string, Analysis> = new Map();
  private nextId = 1;

  constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  private async loadData() {
    try {
      // Load documents
      try {
        const documentsData = await fs.readFile(this.documentsFile, 'utf8');
        const documentsArray = JSON.parse(documentsData);
        this.documents = new Map(documentsArray.map((doc: any) => [doc.id, doc]));
      } catch (error) {
        console.log('No existing documents found, starting fresh');
      }

      // Load analyses
      try {
        const analysesData = await fs.readFile(this.analysesFile, 'utf8');
        const analysesArray = JSON.parse(analysesData);
        this.analyses = new Map(analysesArray.map((analysis: any) => [analysis.id, analysis]));
      } catch (error) {
        console.log('No existing analyses found, starting fresh');
      }

      // Find the highest ID to continue from
      const allIds = Array.from(this.documents.keys()).concat(Array.from(this.analyses.keys()));
      if (allIds.length > 0) {
        const maxId = Math.max(...allIds.map(id => parseInt(id.split('_')[1])));
        this.nextId = maxId + 1;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  private async saveData() {
    try {
      // Save documents
      const documentsArray = Array.from(this.documents.values());
      await fs.writeFile(this.documentsFile, JSON.stringify(documentsArray, null, 2));

      // Save analyses
      const analysesArray = Array.from(this.analyses.values());
      await fs.writeFile(this.analysesFile, JSON.stringify(analysesArray, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

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
    await this.saveData();
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
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
      await this.saveData();
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.documents.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
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
    await this.saveData();
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
      await this.saveData();
    }
  }

  async getStats(): Promise<DocumentStats> {
    const totalDocuments = this.documents.size;
    const activeJobs = Array.from(this.documents.values())
      .filter(doc => doc.type === 'job_description' && doc.status === 'completed').length;
    const processing = Array.from(this.documents.values())
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

  // Helper method to clear all data
  async clearAll(): Promise<void> {
    this.documents.clear();
    this.analyses.clear();
    this.nextId = 1;
    await this.saveData();
  }

  // Helper method to add sample data
  async addSampleData(): Promise<void> {
    if (this.documents.size === 0) {
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
}

export const fileStorage = new FileStorage();
