
import { BarChart3, TrendingUp, Users, Clock, FileText, Target, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Analysis, Document, MatchResult } from "@shared/schema";

export default function Analytics() {
  const queryClient = useQueryClient();
  
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Mutation for updating candidate status
  const updateCandidateStatus = useMutation({
    mutationFn: async ({ analysisId, candidateId, newStatus }: { 
      analysisId: string; 
      candidateId: string; 
      newStatus: 'shortlisted' | 'rejected' 
    }) => {
      const response = await fetch(`/api/analyses/${analysisId}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update candidate status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
    },
  });

  // Calculate real metrics from actual data
  const completedAnalyses = analyses.filter(analysis => analysis.status === 'completed');
  const totalMatches = completedAnalyses.reduce((sum, analysis) => 
    sum + (Array.isArray(analysis.results) ? analysis.results.length : 0), 0
  );
  
  const allMatches = completedAnalyses.flatMap(analysis => 
    Array.isArray(analysis.results) ? analysis.results : []
  );
  
  // Categorize matches by status
  const shortlistedCandidates = allMatches.filter(match => match.status === 'shortlisted').length;
  const rejectedCandidates = allMatches.filter(match => match.status === 'rejected').length;
  const pendingCandidates = allMatches.filter(match => match.status === 'pending').length;
  
  // Legacy score-based categorization
  const excellentMatches = allMatches.filter(match => match.overallScore >= 90).length;
  const goodMatches = allMatches.filter(match => match.overallScore >= 70 && match.overallScore < 90).length;
  const fairMatches = allMatches.filter(match => match.overallScore >= 50 && match.overallScore < 70).length;
  const poorMatches = allMatches.filter(match => match.overallScore < 50).length;

  const successRate = completedAnalyses.length > 0 ? 
    Math.round((completedAnalyses.length / analyses.length) * 100) : 0;
  
  const consultantProfiles = documents.filter(doc => doc.type === 'consultant_profile').length;
  const processedDocuments = documents.filter(doc => doc.status === 'completed').length;

  // Helper function to get candidates by status
  const getCandidatesByStatus = (status: 'shortlisted' | 'rejected' | 'pending') => {
    return completedAnalyses.flatMap(analysis => 
      Array.isArray(analysis.results) 
        ? analysis.results.filter(match => match.status === status).map(match => ({
            ...match,
            analysisId: analysis.id,
            jobTitle: analysis.jobTitle,
            analysisDate: analysis.createdAt,
          }))
        : []
    );
  };

  const shortlistedCandidatesList = getCandidatesByStatus('shortlisted');
  const rejectedCandidatesList = getCandidatesByStatus('rejected');
  const pendingCandidatesList = getCandidatesByStatus('pending');

  // Recent activity from actual analyses
  const recentActivities = analyses
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(analysis => {
      const timeAgo = analysis.createdAt ? getTimeAgo(new Date(analysis.createdAt)) : 'Unknown';
      const matchCount = Array.isArray(analysis.results) ? analysis.results.length : 0;
      
      if (analysis.status === 'completed' && matchCount > 0) {
        return {
          time: timeAgo,
          action: `Found ${matchCount} matches for ${analysis.jobTitle}`,
          type: 'success'
        };
      } else if (analysis.status === 'completed' && matchCount === 0) {
        return {
          time: timeAgo,
          action: `No matches found for ${analysis.jobTitle}`,
          type: 'info'
        };
      } else if (analysis.status === 'failed') {
        return {
          time: timeAgo,
          action: `Analysis failed for ${analysis.jobTitle}`,
          type: 'error'
        };
      } else {
        return {
          time: timeAgo,
          action: `Processing ${analysis.jobTitle}`,
          type: 'info'
        };
      }
    });

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  if (analysesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no analyses have been completed
  if (completedAnalyses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your recruitment performance and insights</p>
          </div>

          <div className="text-center py-16">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 max-w-md mx-auto">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete some job analyses to see your recruitment performance metrics and insights here.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>• Total Documents: {documents.length}</p>
                <p>• Analyses in Progress: {analyses.filter(a => a.status === 'processing').length}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your recruitment performance and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Matches"
            value={totalMatches}
            icon={Target}
            color="text-green-600"
          />
          <StatsCard
            title="Shortlisted"
            value={shortlistedCandidates}
            icon={Target}
            color="text-green-600"
          />
          <StatsCard
            title="Rejected"
            value={rejectedCandidates}
            icon={FileText}
            color="text-red-600"
          />
          <StatsCard
            title="Pending Review"
            value={pendingCandidates}
            icon={Clock}
            color="text-orange-600"
          />
        </div>

        {/* Candidate Management Tabs */}
        <Tabs defaultValue="overview" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedCandidates})</TabsTrigger>
            <TabsTrigger value="pending">Decision Pending ({pendingCandidates})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCandidates})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Matching Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Candidate Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shortlisted Candidates</span>
                  <span className="text-sm text-green-600 font-bold">{shortlistedCandidates}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(excellentMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending Review</span>
                  <span className="text-sm text-orange-600 font-bold">{pendingCandidates}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(goodMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rejected Candidates</span>
                  <span className="text-sm text-red-600 font-bold">{rejectedCandidates}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(fairMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>


              </div>
            </CardContent>
          </Card>

          {/* Document Processing Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Document Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{documents.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents Processed</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">
                      {documents.length > 0 ? Math.round((processedDocuments / documents.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xl font-semibold text-blue-600">{completedAnalyses.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Analyses</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Document Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Job Descriptions</span>
                      <span className="font-medium">
                        {documents.filter(doc => doc.type === 'job_description').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consultant Profiles</span>
                      <span className="font-medium">{consultantProfiles}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          {/* Shortlisted Candidates Tab */}
          <TabsContent value="shortlisted" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Shortlisted Candidates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shortlistedCandidatesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No shortlisted candidates yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shortlistedCandidatesList.map((candidate, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800 dark:text-green-200">
                            {candidate.consultantName}
                          </h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                            {candidate.overallScore}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Job:</strong> {candidate.jobTitle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Role:</strong> {candidate.role || 'Consultant'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Experience:</strong> {candidate.experienceYears}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matchedSkills.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision Pending Tab */}
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Decision Pending - Manual Review Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingCandidatesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No candidates pending review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCandidatesList.map((candidate, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-orange-800 dark:text-orange-200">
                            {candidate.consultantName}
                          </h4>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                            {candidate.overallScore}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Job:</strong> {candidate.jobTitle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Role:</strong> {candidate.role || 'Consultant'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Experience:</strong> {candidate.experienceYears}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidate.matchedSkills.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <strong>Summary:</strong> {candidate.summary}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateCandidateStatus.mutate({
                              analysisId: candidate.analysisId,
                              candidateId: candidate.consultantId,
                              newStatus: 'shortlisted'
                            })}
                            disabled={updateCandidateStatus.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateCandidateStatus.mutate({
                              analysisId: candidate.analysisId,
                              candidateId: candidate.consultantId,
                              newStatus: 'rejected'
                            })}
                            disabled={updateCandidateStatus.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Candidates Tab */}
          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>Rejected Candidates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedCandidatesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No rejected candidates</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedCandidatesList.map((candidate, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-red-800 dark:text-red-200">
                            {candidate.consultantName}
                          </h4>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">
                            {candidate.overallScore}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Job:</strong> {candidate.jobTitle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Role:</strong> {candidate.role || 'Consultant'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Experience:</strong> {candidate.experienceYears}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matchedSkills.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity Timeline */}
        {recentActivities.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
