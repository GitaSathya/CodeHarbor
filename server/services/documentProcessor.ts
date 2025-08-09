
import { storage } from "../storage";
import { analyzeDocumentSimilarity, extractJobTitle } from "./gemini";
import * as yauzl from 'yauzl';

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

    // Get consultant profiles specifically for this job
    const allDocs = await storage.getAllDocuments();
    const consultantProfiles = allDocs
      .filter(doc => 
        doc.type === 'consultant_profile' && 
        doc.status === 'completed' &&
        doc.jobDescriptionId === jobDescriptionId
      )
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        content: doc.content,
      }));

    if (consultantProfiles.length === 0) {
      await storage.updateAnalysisStatus(analysis.id, 'completed', []);
      return;
    }

    // Analyze similarity using Gemini
    const matches = await analyzeDocumentSimilarity(jobDoc.content, consultantProfiles);

    // Update analysis with results
    await storage.updateAnalysisStatus(analysis.id, 'completed', matches);

  } catch (error) {
    console.error('Error processing job analysis:', error);
    throw error;
  }
}

export function extractTextFromFile(buffer: Buffer, filename: string): string {
  // For MVP, just convert buffer to string
  // In production, you'd use proper PDF/Word parsing libraries
  const content = buffer.toString('utf8');
  
  // Basic cleanup for common file types
  if (filename.toLowerCase().endsWith('.pdf')) {
    // PDF files might have binary content, so we'll just return a placeholder
    return `[PDF Content] - ${filename}\n\nContent extracted from PDF file. In production, use proper PDF parsing library.`;
  }
  
  return content;
}

export async function extractZipFiles(buffer: Buffer): Promise<Array<{ name: string; content: string }>> {
  return new Promise((resolve, reject) => {
    const files: Array<{ name: string; content: string }> = [];
    
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error(`Failed to read ZIP file: ${err.message}`));
        return;
      }

      if (!zipfile) {
        reject(new Error('Invalid ZIP file'));
        return;
      }

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        // Skip directories
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }

        // Only process supported file types
        const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const isSupported = supportedExtensions.some(ext => 
          entry.fileName.toLowerCase().endsWith(ext)
        );

        if (!isSupported) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            reject(new Error(`Failed to read entry ${entry.fileName}: ${err.message}`));
            return;
          }

          if (!readStream) {
            zipfile.readEntry();
            return;
          }

          const chunks: Buffer[] = [];
          readStream.on('data', (chunk) => {
            chunks.push(chunk);
          });

          readStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const content = extractTextFromFile(buffer, entry.fileName);
            
            files.push({
              name: entry.fileName,
              content: content
            });

            zipfile.readEntry();
          });

          readStream.on('error', (err) => {
            reject(new Error(`Error reading ${entry.fileName}: ${err.message}`));
          });
        });
      });

      zipfile.on('end', () => {
        resolve(files);
      });

      zipfile.on('error', (err) => {
        reject(new Error(`ZIP processing error: ${err.message}`));
      });
    });
  });
}
