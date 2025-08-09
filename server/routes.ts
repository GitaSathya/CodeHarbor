
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertAnalysisSchema } from "@shared/schema";
import { processJobAnalysis, extractTextFromFile, extractZipFiles } from "./services/documentProcessor";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.txt') || file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or ZIP files.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload document
  app.post("/api/documents/upload", upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { type, jobDescriptionId } = req.body;
      if (!type || !['job_description', 'consultant_profile'].includes(type)) {
        return res.status(400).json({ message: "Invalid document type" });
      }

      // Validate jobDescriptionId for consultant profiles
      if (type === 'consultant_profile' && !jobDescriptionId) {
        return res.status(400).json({ message: "Job description ID is required for consultant profiles" });
      }

      // Verify job description exists if provided
      if (jobDescriptionId) {
        const jobExists = await storage.getDocument(jobDescriptionId);
        if (!jobExists || jobExists.type !== 'job_description') {
          return res.status(400).json({ message: "Invalid job description ID" });
        }
      }

      // Check if uploaded file is a ZIP
      if (req.file.originalname.toLowerCase().endsWith('.zip')) {
        try {
          const { extractZipFiles } = await import('./services/documentProcessor');
          const extractedFiles = await extractZipFiles(req.file.buffer);
          
          const createdDocuments = [];
          
          for (const file of extractedFiles) {
            const documentData = insertDocumentSchema.parse({
              name: file.name,
              type,
              content: file.content,
              jobDescriptionId: type === 'consultant_profile' ? jobDescriptionId : undefined,
            });

            const document = await storage.createDocument(documentData);
            await storage.updateDocumentStatus(document.id, 'completed');
            createdDocuments.push(document);
          }
          
          res.json({ 
            message: `Successfully extracted and uploaded ${createdDocuments.length} files from ZIP`,
            documents: createdDocuments 
          });
        } catch (error) {
          console.error('ZIP extraction error:', error);
          res.status(500).json({ 
            message: error instanceof Error ? error.message : "Failed to extract ZIP file" 
          });
        }
      } else {
        // Handle single file upload
        const content = extractTextFromFile(req.file.buffer, req.file.originalname);
        
        const documentData = insertDocumentSchema.parse({
          name: req.file.originalname,
          type,
          content,
          jobDescriptionId: type === 'consultant_profile' ? jobDescriptionId : undefined,
        });

        const document = await storage.createDocument(documentData);
        
        // Mark as completed immediately for MVP
        await storage.updateDocumentStatus(document.id, 'completed');

        res.json(document);
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to upload document" 
      });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Start analysis
  app.post("/api/analysis", async (req, res) => {
    try {
      const { jobDescriptionId } = insertAnalysisSchema.parse(req.body);
      
      // Start analysis in background
      processJobAnalysis(jobDescriptionId).catch(error => {
        console.error('Analysis failed:', error);
      });

      res.json({ message: "Analysis started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start analysis" });
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
