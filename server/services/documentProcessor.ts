
import { storage } from "../storage";
import { analyzeDocumentSimilarity, extractJobTitle } from "./gemini";
import { emailService } from "./emailService";
import { notificationService } from "./notificationService";
import * as yauzl from 'yauzl';

export async function processJobAnalysis(jobDescriptionId: string, userEmail?: string): Promise<void> {
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

    // Notify processing started
    await notificationService.notifyProcessingStarted(jobTitle);

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
      
      // Notify completion
      await notificationService.notifyProcessingComplete(jobTitle, 0);
      
      // Send email notification if enabled and email provided
      if (userEmail) {
        try {
          await emailService.sendProcessingCompleteEmail(userEmail, jobTitle, 0);
        } catch (emailError) {
          console.error('Failed to send completion email:', emailError);
        }
      }
      
      return;
    }

    // Get user's threshold settings (default to 80% for shortlist, 50% for rejection)
    const shortlistThreshold = 80; // This could come from user settings
    const rejectionThreshold = 50; // This could come from user settings
    
    // Analyze similarity using Gemini
    const matches = await analyzeDocumentSimilarity(jobDoc.content, consultantProfiles, shortlistThreshold, rejectionThreshold);

    // Update analysis with results
    await storage.updateAnalysisStatus(analysis.id, 'completed', matches);

    // Notify processing completion
    await notificationService.notifyProcessingComplete(jobTitle, matches.length);

    // Check for high similarity matches (80%+)
    const highSimilarityMatches = matches.filter(match => match.overallScore >= 80);
    
    if (highSimilarityMatches.length > 0) {
      // Notify about high similarity matches
      await notificationService.notifyHighSimilarityMatch(jobTitle, highSimilarityMatches);
      
      // Send high similarity email alert if enabled and email provided
      if (userEmail) {
        try {
          await emailService.sendHighSimilarityMatchEmail(userEmail, jobTitle, {
            jobTitle,
            matchCount: matches.length,
            highSimilarityMatches: highSimilarityMatches.map(match => ({
              name: match.consultantName,
              score: match.overallScore
            }))
          });
        } catch (emailError) {
          console.error('Failed to send high similarity email:', emailError);
        }
      }
    }

    // Send general completion email if enabled and email provided
    if (userEmail) {
      try {
        await emailService.sendProcessingCompleteEmail(userEmail, jobTitle, matches.length);
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
      }
    }

  } catch (error) {
    console.error('Error processing job analysis:', error);
    
    // Try to get job title for error notification
    let jobTitle = 'Unknown Job';
    try {
      const jobDoc = await storage.getDocument(jobDescriptionId);
      if (jobDoc) {
        jobTitle = await extractJobTitle(jobDoc.content);
      }
    } catch (titleError) {
      console.error('Failed to get job title for error notification:', titleError);
    }
    
    // Notify failure
    await notificationService.notifyAnalysisFailed(jobTitle);
    
    throw error;
  }
}

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  try {
    const fileExtension = filename.toLowerCase();
    
    if (fileExtension.endsWith('.pdf')) {
      try {
        // Use pdfjs-dist for PDF files (more reliable than pdf-parse)
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker path for PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        return fullText.trim() || `[PDF Content] - ${filename}\n\nNo text content found in PDF.`;
      } catch (pdfError) {
        console.error(`PDF parsing error for ${filename}:`, pdfError);
        // Fallback: try to extract text using buffer conversion
        try {
          const text = buffer.toString('utf8');
          // Check if the buffer contains readable text
          if (text && text.length > 0 && !text.includes('\x00')) {
            return `[PDF Fallback] - ${filename}\n\n${text.substring(0, 1000)}...`;
          }
        } catch (fallbackError) {
          console.error(`Fallback text extraction failed for ${filename}:`, fallbackError);
        }
        return `[PDF Error] - ${filename}\n\nFailed to extract content from PDF. Please ensure the file is not corrupted.`;
      }
    } else if (fileExtension.endsWith('.doc') || fileExtension.endsWith('.docx')) {
      // For Word documents, return a placeholder (would need additional libraries for full support)
      return `[Word Document] - ${filename}\n\nContent extracted from Word document. In production, use proper Word parsing library.`;
    } else if (fileExtension.endsWith('.txt')) {
      // Text files can be converted directly
      return buffer.toString('utf8');
    } else {
      // Try to convert as text, but warn about potential issues
      try {
        return buffer.toString('utf8');
      } catch (error) {
        return `[Binary File] - ${filename}\n\nUnable to extract text content from this file type.`;
      }
    }
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error);
    return `[Error] - ${filename}\n\nFailed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function extractZipFiles(buffer: Buffer): Promise<Array<{ name: string; content: string }>> {
  return new Promise((resolve, reject) => {
    const files: Array<{ name: string; content: string }> = [];
    
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err: any, zipfile: any) => {
      if (err) {
        reject(new Error(`Failed to read ZIP file: ${err.message}`));
        return;
      }

      if (!zipfile) {
        reject(new Error('Invalid ZIP file'));
        return;
      }

      zipfile.readEntry();

      zipfile.on('entry', (entry: any) => {
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

        zipfile.openReadStream(entry, (err: any, readStream: any) => {
          if (err) {
            reject(new Error(`Failed to read entry ${entry.fileName}: ${err.message}`));
            return;
          }

          if (!readStream) {
            zipfile.readEntry();
            return;
          }

          const chunks: Buffer[] = [];
          readStream.on('data', (chunk: any) => {
            chunks.push(chunk);
          });

          readStream.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const content = await extractTextFromFile(buffer, entry.fileName);
              
              files.push({
                name: entry.fileName,
                content: content
              });
            } catch (error) {
              console.error(`Error processing ${entry.fileName}:`, error);
              // Add error file to results
              files.push({
                name: entry.fileName,
                content: `[Error] Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
            }
            zipfile.readEntry();
          });

          readStream.on('error', (err: any) => {
            reject(new Error(`Error reading ${entry.fileName}: ${err.message}`));
          });
        });
      });

      zipfile.on('end', () => {
        resolve(files);
      });

      zipfile.on('error', (err: any) => {
        reject(new Error(`ZIP processing error: ${err.message}`));
      });
    });
  });
}
