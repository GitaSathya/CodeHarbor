import { GoogleGenAI } from "@google/genai";
import { MatchResult } from "@shared/schema";

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeDocumentSimilarity(
  jobDescription: string,
  consultantProfiles: Array<{ id: string; name: string; content: string }>,
  shortlistThreshold: number = 80,
  rejectionThreshold: number = 50
): Promise<MatchResult[]> {
  try {
    const prompt = `
    You are an expert AI recruitment assistant. Analyze the job description and consultant profiles to find the best matches.

    Job Description:
    ${jobDescription}

    Consultant Profiles:
    ${consultantProfiles.map((profile, index) => `
    Profile ${index + 1} (ID: ${profile.id}):
    Name: ${profile.name}
    Content: ${profile.content}
    `).join('\n')}

    For each consultant profile, analyze:
    1. Skills Match (0-100): How well their technical skills match the job requirements
    2. Experience Match (0-100): How well their experience level and background match
    3. Context Match (0-100): How well their overall profile context fits the role
    4. Overall Score (0-100): Weighted average of the above scores
    5. Extract matched skills as an array of strings
    6. Extract years of experience as a string

    Return a JSON object with this structure:
    {
      "matches": [
        {
          "profileId": "string",
          "profileName": "string", 
          "role": "extracted role/title from profile",
          "overallScore": number,
          "skillsMatch": number,
          "experienceMatch": number,
          "contextMatch": number,
          "matchedSkills": ["skill1", "skill2"],
          "experience": "X years"
        }
      ]
    }

    Include ALL profiles and sort by overall score descending. We will categorize them based on scores later.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert AI recruitment assistant that analyzes document similarity for job matching. Always respond with valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  profileId: { type: "string" },
                  profileName: { type: "string" },
                  role: { type: "string" },
                  overallScore: { type: "number" },
                  skillsMatch: { type: "number" },
                  experienceMatch: { type: "number" },
                  contextMatch: { type: "number" },
                  matchedSkills: { type: "array", items: { type: "string" } },
                  experience: { type: "string" }
                },
                required: ["profileId", "profileName", "role", "overallScore", "skillsMatch", "experienceMatch", "contextMatch", "matchedSkills", "experience"]
              }
            }
          },
          required: ["matches"]
        },
        temperature: 0.3,
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const result = JSON.parse(rawJson);
      const matches = result.matches || [];
      
      // Add status based on thresholds
      const processedMatches = matches.map((match: any) => {
        let status: 'shortlisted' | 'rejected' | 'pending' = 'pending';
        
        if (match.overallScore >= shortlistThreshold) {
          status = 'shortlisted';
        } else if (match.overallScore < rejectionThreshold) {
          status = 'rejected';
        }
        
        return {
          ...match,
          consultantId: match.profileId,
          consultantName: match.profileName,
          experienceYears: match.experience,
          status,
        };
      });
      
      return processedMatches;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error('Error analyzing document similarity:', error);
    throw new Error('Failed to analyze document similarity: ' + (error as Error).message);
  }
}

export async function extractJobTitle(jobDescription: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `Extract the job title from the given job description. Return only the job title as plain text.\n\nJob Description: ${jobDescription}`
          }]
        }
      ],
    });

    return response.text?.trim() || "Unknown Position";
  } catch (error) {
    console.error('Error extracting job title:', error);
    return "Unknown Position";
  }
}
