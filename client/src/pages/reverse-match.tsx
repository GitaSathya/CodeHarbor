import { Upload, FileText, Search, Briefcase, CheckCircle, AlertTriangle, Clock, Users, TrendingUp } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

interface JobMatch {
  jobId: string;
  jobTitle: string;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  contextMatch: number;
  keyMatchedSkills: string[];
  potentialConcerns: string[];
  recommendation: string;
}

interface ReverseMatchResult {
  candidateSummary: string;
  matches: JobMatch[];
}

export default function ReverseMatch() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [analysisResult, setAnalysisResult] = useState<ReverseMatchResult | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read file content
      const text = await file.text();
      setResumeContent(text);
      
      toast({
        title: "Resume uploaded",
        description: `${file.name} has been loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeContent.trim()) {
      toast({
        title: "Resume content required",
        description: "Please upload a resume or paste the content first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/reverse-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: resumeContent.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis complete",
        description: `Found ${result.matches.length} suitable job matches.`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resume to Job Matcher</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload a candidate's resume and let AI find the best job matches from your available positions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload & Analysis */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Resume Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume-file">Upload Resume File</Label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      id="resume-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button className="w-full flex items-center space-x-2" variant="outline">
                      <Upload className="w-4 h-4" />
                      <span>Choose Resume File</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                {/* Manual Content Input */}
                <div className="space-y-2">
                  <Label htmlFor="resume-content">Or Paste Resume Content</Label>
                  <textarea
                    id="resume-content"
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                    placeholder="Paste the candidate's resume content here..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Email for Notifications */}
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email for Results (Optional)</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="hr@company.com"
                  />
                  <p className="text-xs text-gray-500">
                    Receive analysis results via email
                  </p>
                </div>

                {/* Analyze Button */}
                <Button 
                  onClick={handleAnalyzeResume} 
                  disabled={isAnalyzing || !resumeContent.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Job Matches
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>How It Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Upload a candidate's resume or paste the content</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>AI analyzes skills, experience, and background</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Get ranked job matches with detailed insights</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Receive email notifications with results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {isAnalyzing ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Analyzing Resume
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI is analyzing the candidate's profile against available job descriptions...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : analysisResult ? (
              <>
                {/* Candidate Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Candidate Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {analysisResult.candidateSummary}
                    </p>
                  </CardContent>
                </Card>

                {/* Job Matches */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <span>Job Matches ({analysisResult.matches.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.matches.map((match, index) => (
                      <div key={match.jobId} className="border rounded-lg p-4 space-y-3">
                        {/* Job Title & Score */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {index + 1}. {match.jobTitle}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Overall Match Score
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(match.overallScore)}`}>
                              {match.overallScore}%
                            </div>
                            <Badge variant={getScoreBadgeVariant(match.overallScore)}>
                              {match.overallScore >= 80 ? 'Excellent' : 
                               match.overallScore >= 60 ? 'Good' : 
                               match.overallScore >= 40 ? 'Fair' : 'Poor'}
                            </Badge>
                          </div>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Skills</p>
                            <p className="font-medium">{match.skillsMatch}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Experience</p>
                            <p className="font-medium">{match.experienceMatch}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Context</p>
                            <p className="font-medium">{match.contextMatch}%</p>
                          </div>
                        </div>

                        {/* Key Skills */}
                        {match.keyMatchedSkills.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Key Matched Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {match.keyMatchedSkills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Potential Concerns */}
                        {match.potentialConcerns.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Potential Concerns:</p>
                            <div className="space-y-1">
                              {match.potentialConcerns.map((concern, concernIndex) => (
                                <div key={concernIndex} className="flex items-center space-x-2 text-sm text-orange-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{concern}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Recommendation:</strong> {match.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Ready to Find Job Matches
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upload a resume or paste content to start the AI-powered job matching analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
