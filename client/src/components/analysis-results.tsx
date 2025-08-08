import { Trophy, AlertTriangle, Filter, Search, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Analysis, Document } from "@shared/schema";
import MatchCard from "./match-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AnalysisResults() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading: analysesLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const startAnalysisMutation = useMutation({
    mutationFn: async (jobDescriptionId: string) => {
      const response = await apiRequest('POST', '/api/analysis', { jobDescriptionId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
      toast({
        title: "Analysis started",
        description: "AI analysis is now processing your job description.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const jobDescriptions = documents.filter(doc => doc.type === 'job_description');
  const consultantProfiles = documents.filter(doc => doc.type === 'consultant_profile');
  const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;

  const handleStartAnalysis = (jobDescriptionId: string) => {
    startAnalysisMutation.mutate(jobDescriptionId);
  };

  const jobDescriptions = documents.filter(doc => 
    doc.type === 'job_description' && doc.status === 'completed'
  );

  const latestAnalysis = analyses[0];

  const handleStartAnalysis = (jobDescriptionId: string) => {
    startAnalysisMutation.mutate(jobDescriptionId);
  };

  if (analysesLoading) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-material-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-material-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Trophy className="text-primary mr-2" />
            Analysis Results
          </h2>
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleStartAnalysis} disabled={jobDescriptions.length === 0}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={jobDescriptions.length === 0 ? "No job descriptions" : "Analyze job description..."} />
              </SelectTrigger>
              <SelectContent>
                {jobDescriptions.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {analysesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600">Loading analysis results...</p>
            </div>
          </div>
        ) : (
          <>
            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Find Perfect Matches</h3>
                  <p className="text-gray-600 mb-4">
                    Upload job descriptions and consultant profiles, then start an analysis to see AI-powered matching results.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>• Job Descriptions: {jobDescriptions.length}</p>
                    <p>• Consultant Profiles: {consultantProfiles.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {latestAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-medium text-blue-800">Latest Analysis: {latestAnalysis.jobTitle}</h4>
                        <p className="text-sm text-blue-600">
                          Status: {latestAnalysis.status} • 
                          Matches: {latestAnalysis.results?.length || 0} found
                        </p>
                      </div>
                      <div className="text-right text-sm text-blue-600">
                        {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {latestAnalysis.results && latestAnalysis.results.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Top Matches:</h4>
                        {latestAnalysis.results.slice(0, 3).map((match, index) => (
                          <MatchCard key={match.profileId} match={match} rank={index + 1} />
                        ))}
                        {latestAnalysis.results.length > 3 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            +{latestAnalysis.results.length - 3} more matches available
                          </p>
                        )}
                      </div>
                    ) : latestAnalysis.status === 'completed' ? (
                      <div className="text-center py-6">
                        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                          <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                          <h4 className="font-medium text-yellow-800">{latestAnalysis.jobTitle}</h4>
                          <p className="text-sm text-yellow-600">
                            No suitable matches found. Consider expanding search criteria or adding more consultant profiles.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-gray-600">Analysis in progress...</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

        {!latestAnalysis && (
          <div className="text-center py-12">
            <Trophy className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-gray-600 mb-4">Upload job descriptions and consultant profiles to get started.</p>
          </div>
        )}

        {latestAnalysis && (
          <>
            {/* Job Analysis Card */}
            <div className="border rounded-lg p-4 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{latestAnalysis.jobTitle}</h3>
                <div className="flex items-center space-x-2">
                  {latestAnalysis.status === 'processing' && (
                    <>
                      <Clock className="text-orange-500 w-4 h-4" />
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">Processing</span>
                    </>
                  )}
                  {latestAnalysis.status === 'completed' && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">Completed</span>
                  )}
                  {latestAnalysis.status === 'failed' && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">Failed</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="text-sm mr-1" />
                <span>Analyzed {new Date(latestAnalysis.createdAt!).toLocaleString()}</span>
              </div>
            </div>

            {latestAnalysis.status === 'completed' && latestAnalysis.matches && (
              <>
                {Array.isArray(latestAnalysis.matches) && latestAnalysis.matches.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Trophy className="text-green-500 mr-2" />
                      Top Matches
                    </h4>
                    
                    {latestAnalysis.matches.slice(0, 3).map((match: any, index: number) => (
                      <MatchCard
                        key={match.profileId}
                        rank={index + 1}
                        name={match.profileName}
                        role={match.role}
                        overallScore={match.overallScore}
                        skillsMatch={match.skillsMatch}
                        experienceMatch={match.experienceMatch}
                        contextMatch={match.contextMatch}
                        matchedSkills={match.matchedSkills}
                        experience={match.experience}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-800">{latestAnalysis.jobTitle}</h4>
                        <p className="text-sm text-red-600">
                          No suitable matches found. Consider expanding search criteria or adding more consultant profiles.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
