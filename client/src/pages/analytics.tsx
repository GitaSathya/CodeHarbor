
import { BarChart3, TrendingUp, Users, Clock, FileText, Target } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/stats-card";

export default function Analytics() {
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
            value={247}
            icon={Target}
            color="text-green-600"
          />
          <StatsCard
            title="Success Rate"
            value="87%"
            icon={TrendingUp}
            color="text-blue-600"
          />
          <StatsCard
            title="Avg. Processing Time"
            value="2.3s"
            icon={Clock}
            color="text-orange-600"
          />
          <StatsCard
            title="Active Consultants"
            value={156}
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
                  <span className="text-sm text-green-600">42</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Good Matches (70-89%)</span>
                  <span className="text-sm text-blue-600">89</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fair Matches (50-69%)</span>
                  <span className="text-sm text-orange-600">67</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Poor Matches (<50%)</span>
                  <span className="text-sm text-red-600">23</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '25%'}}></div>
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
                  <div className="text-3xl font-bold text-primary mb-2">1,247</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents Processed</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">98.2%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xl font-semibold text-blue-600">1.8s</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Time</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Document Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Job Descriptions</span>
                      <span className="font-medium">342</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consultant Profiles</span>
                      <span className="font-medium">905</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "2 minutes ago", action: "Processed job description: Senior Full Stack Developer", type: "success" },
                { time: "15 minutes ago", action: "Found 12 matches for Data Scientist position", type: "info" },
                { time: "1 hour ago", action: "Uploaded 5 consultant profiles", type: "info" },
                { time: "3 hours ago", action: "Processing failed for corrupted document", type: "error" },
                { time: "5 hours ago", action: "Generated analytics report", type: "success" }
              ].map((activity, index) => (
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
      </main>
    </div>
  );
}
