
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storageFactory";
import { insertDocumentSchema, insertAnalysisSchema } from "@shared/schema";
import { processJobAnalysis, extractTextFromFile, extractZipFiles } from "./services/documentProcessor";
import { notificationService } from "./services/notificationService";
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
        const content = await extractTextFromFile(req.file.buffer, req.file.originalname);
        
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
      const { jobDescriptionId, userEmail } = req.body;
      
      // Validate jobDescriptionId
      if (!jobDescriptionId) {
        return res.status(400).json({ message: "Job description ID is required" });
      }
      
      // Start analysis in background with optional email
      processJobAnalysis(jobDescriptionId, userEmail).catch(error => {
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

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const { userId } = req.query;
      const notifications = await notificationService.getNotifications(userId as string);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const success = await notificationService.markAsRead(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      const { userId } = req.body;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const success = await notificationService.deleteNotification(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Test Gemini API connection
  app.post("/api/test-gemini", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }

      // Test the API key by making a simple request to Gemini
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [{ text: "Hello, this is a test message to verify API connectivity." }]
        }],
        config: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      });

      if (response.text) {
        res.json({ 
          success: true, 
          message: "API connection successful",
          response: response.text 
        });
      } else {
        throw new Error("Empty response from Gemini API");
      }
    } catch (error) {
      console.error('Gemini API test error:', error);
      res.status(500).json({ 
        message: "Failed to connect to Gemini API", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Reverse matching - analyze resume and suggest best job matches
  app.post("/api/reverse-match", async (req, res) => {
    try {
      const { resumeContent, userEmail } = req.body;
      
      if (!resumeContent) {
        return res.status(400).json({ message: "Resume content is required" });
      }

      // Get all available job descriptions
      const allJobs = await storage.getAllDocuments();
      const jobDescriptions = allJobs.filter(doc => doc.type === 'job_description');
      
      if (jobDescriptions.length === 0) {
        return res.status(404).json({ message: "No job descriptions found. Please upload some job descriptions first." });
      }

      // Get Gemini API key from environment or request
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({ message: "Gemini API key not configured on server" });
      }

      // Analyze resume against all job descriptions
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      const prompt = `
      You are an expert AI recruitment assistant. Analyze the candidate's resume and match it against available job descriptions to find the best fits.

      Candidate Resume:
      ${resumeContent}

      Available Job Descriptions:
      ${jobDescriptions.map((job, index) => `
      Job ${index + 1} (ID: ${job.id}):
      ${job.content}
      `).join('\n')}

      For each job description, analyze:
      1. Skills Match (0-100): How well the candidate's skills match the job requirements
      2. Experience Match (0-100): How well the candidate's experience level fits the role
      3. Context Match (0-100): How well the candidate's background fits the company/industry
      4. Overall Score (0-100): Weighted average of the above scores
      5. Key Matched Skills: List of skills that align well
      6. Potential Concerns: Any areas where the candidate might not be a good fit

      Return a JSON object with this structure:
      {
        "candidateSummary": "Brief summary of the candidate's profile",
        "matches": [
          {
            "jobId": "string",
            "jobTitle": "extracted job title",
            "overallScore": number,
            "skillsMatch": number,
            "experienceMatch": number,
            "contextMatch": number,
            "keyMatchedSkills": ["skill1", "skill2"],
            "potentialConcerns": ["concern1", "concern2"],
            "recommendation": "string explaining why this job is a good fit"
          }
        ]
      }

      Only include jobs with an overall score of 50 or higher. Sort by overall score descending.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: "You are an expert AI recruitment assistant that analyzes resume-to-job matching. Always respond with valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              candidateSummary: { type: "string" },
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    jobId: { type: "string" },
                    jobTitle: { type: "string" },
                    overallScore: { type: "number" },
                    skillsMatch: { type: "number" },
                    experienceMatch: { type: "number" },
                    contextMatch: { type: "number" },
                    keyMatchedSkills: { type: "array", items: { type: "string" } },
                    potentialConcerns: { type: "array", items: { type: "string" } },
                    recommendation: { type: "string" }
                  },
                  required: ["jobId", "jobTitle", "overallScore", "skillsMatch", "experienceMatch", "contextMatch", "keyMatchedSkills", "potentialConcerns", "recommendation"]
                }
              }
            },
            required: ["candidateSummary", "matches"]
          },
          temperature: 0.3,
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (rawJson) {
        const result = JSON.parse(rawJson);
        
        // Send email notification if email provided
        if (userEmail) {
          try {
            await notificationService.notifyReverseMatchComplete(userEmail, result);
          } catch (emailError) {
            console.error('Failed to send reverse match email:', emailError);
          }
        }

        res.json(result);
      } else {
        throw new Error("Empty response from Gemini API");
      }
    } catch (error) {
      console.error('Reverse match error:', error);
      res.status(500).json({ 
        message: "Failed to analyze resume", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update candidate status (manual shortlist/reject)
  app.patch('/api/analyses/:analysisId/candidates/:candidateId/status', async (req, res) => {
    try {
      const { analysisId, candidateId } = req.params;
      const { status } = req.body;
      
      if (!['shortlisted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "shortlisted" or "rejected"' });
      }
      
      const analysis = await storage.getAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      
      if (!analysis.results || !Array.isArray(analysis.results)) {
        return res.status(400).json({ message: 'Analysis has no results' });
      }
      
      // Find and update the candidate status
      const candidateIndex = analysis.results.findIndex(
        (result: any) => result.consultantId === candidateId
      );
      
      if (candidateIndex === -1) {
        return res.status(404).json({ message: 'Candidate not found in analysis' });
      }
      
      // Update the candidate status
      analysis.results[candidateIndex].status = status;
      
      // Update the analysis in storage
      await storage.updateAnalysisStatus(analysisId, analysis.status, analysis.results);
      
      res.json({ 
        message: `Candidate status updated to ${status}`,
        candidateId,
        newStatus: status
      });
      
    } catch (error) {
      console.error('Error updating candidate status:', error);
      res.status(500).json({ message: 'Failed to update candidate status: ' + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
