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

export async function extractZipFiles(buffer: Buffer): Promise<Array<{ name: string; content: string }>> {
  return new Promise((resolve, reject) => {
    const extractedFiles: Array<{ name: string; content: string }> = [];
    
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!zipfile) {
        reject(new Error('Invalid ZIP file'));
        return;
      }

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry, skip
          zipfile.readEntry();
          return;
        }

        // Check if file has supported extension
        const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const hasValidExtension = supportedExtensions.some(ext => 
          entry.fileName.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
          zipfile.readEntry();
          return;
        }

        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            reject(err);
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
            const fileBuffer = Buffer.concat(chunks);
            const content = extractTextFromFile(fileBuffer, entry.fileName);
            
            extractedFiles.push({
              name: entry.fileName,
              content: content
            });

            zipfile.readEntry();
          });

          readStream.on('error', (err) => {
            reject(err);
          });
        });
      });

      zipfile.on('end', () => {
        resolve(extractedFiles);
      });

      zipfile.on('error', (err) => {
        reject(err);
      });
    });
  });
}
