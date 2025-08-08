import { Trophy, AlertTriangle, Filter, Search, Clock } from "lucide-react";
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
            <Select onValueChange={handleStartAnalysis}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Analyze job description..." />
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
              <Filter className="text-gray-600" />
            </Button>
            <Button variant="outline" size="icon">
              <Search className="text-gray-600" />
            </Button>
          </div>
        </div>

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
