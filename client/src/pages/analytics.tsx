
import { BarChart3, TrendingUp, Users, Clock, FileText, Target } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/stats-card";
import { useQuery } from "@tanstack/react-query";
import { Analysis, Document } from "@shared/schema";

export default function Analytics() {
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Calculate real metrics from actual data
  const completedAnalyses = analyses.filter(analysis => analysis.status === 'completed');
  const totalMatches = completedAnalyses.reduce((sum, analysis) => 
    sum + (Array.isArray(analysis.results) ? analysis.results.length : 0), 0
  );
  
  const allMatches = completedAnalyses.flatMap(analysis => 
    Array.isArray(analysis.results) ? analysis.results : []
  );
  
  const excellentMatches = allMatches.filter(match => match.overallScore >= 90).length;
  const goodMatches = allMatches.filter(match => match.overallScore >= 70 && match.overallScore < 90).length;
  const fairMatches = allMatches.filter(match => match.overallScore >= 50 && match.overallScore < 70).length;
  const poorMatches = allMatches.filter(match => match.overallScore < 50).length;

  const successRate = completedAnalyses.length > 0 ? 
    Math.round((completedAnalyses.length / analyses.length) * 100) : 0;
  
  const consultantProfiles = documents.filter(doc => doc.type === 'consultant_profile').length;
  const processedDocuments = documents.filter(doc => doc.status === 'completed').length;

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
            title="Success Rate"
            value={successRate}
            icon={TrendingUp}
            color="text-blue-600"
          />
          <StatsCard
            title="Completed Analyses"
            value={completedAnalyses.length}
            icon={Clock}
            color="text-orange-600"
          />
          <StatsCard
            title="Active Consultants"
            value={consultantProfiles}
            icon={Users}
            color="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Matching Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Matching Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Excellent Matches (90%+)</span>
                  <span className="text-sm text-green-600">{excellentMatches}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(excellentMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Good Matches (70-89%)</span>
                  <span className="text-sm text-blue-600">{goodMatches}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(goodMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fair Matches (50-69%)</span>
                  <span className="text-sm text-orange-600">{fairMatches}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(fairMatches / totalMatches) * 100}%` : '0%'}}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Poor Matches (&lt;50%)</span>
                  <span className="text-sm text-red-600">{poorMatches}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{width: totalMatches > 0 ? `${(poorMatches / totalMatches) * 100}%` : '0%'}}
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
