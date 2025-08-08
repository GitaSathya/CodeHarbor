import { storage } from "../storage";
import { analyzeDocumentSimilarity, extractJobTitle } from "./gemini";

export async function processJobAnalysis(jobDescriptionId: string): Promise<void> {
  try {
    const jobDoc = await storage.getDocument(jobDescriptionId);
    if (!jobDoc || jobDoc.type !== 'job_description') {
      throw new Error('Job description not found');
    }

    // Extract job title
    const jobTitle = await extractJobTitle(jobDoc.content);

    // Create analysis record
    const analysis = await storage.createAnalysis({
      jobDescriptionId,
      jobTitle,
    });

    // Get all consultant profiles
    const allDocs = await storage.getAllDocuments();
    const consultantProfiles = allDocs
      .filter(doc => doc.type === 'consultant_profile' && doc.status === 'completed')
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        content: doc.content,
      }));

    if (consultantProfiles.length === 0) {
      await storage.updateAnalysisStatus(analysis.id, 'completed', []);
      return;
    }

    // Analyze similarity using OpenAI
    const matches = await analyzeDocumentSimilarity(jobDoc.content, consultantProfiles);

    // Update analysis with results
    await storage.updateAnalysisStatus(analysis.id, 'completed', matches);

  } catch (error) {
    console.error('Error processing job analysis:', error);
    throw error;
  }
}

export function extractTextFromFile(buffer: Buffer, filename: string): string {
  // For MVP, we'll assume text files or simple extraction
  // In production, you'd use libraries like pdf-parse, mammoth for docx, etc.
  const extension = filename.toLowerCase().split('.').pop();
  
  if (extension === 'txt') {
    return buffer.toString('utf-8');
  }
  
  // For PDF and DOC files, return placeholder for now
  // In production, implement proper extraction
  return buffer.toString('utf-8');
}
