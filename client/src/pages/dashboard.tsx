import { FileText, Briefcase, Users, Clock, Plus, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DocumentStats } from "@shared/schema";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import UploadArea from "@/components/upload-area";
import AnalysisResults from "@/components/analysis-results";
import DocumentTable from "@/components/document-table";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DocumentStats>({
    queryKey: ['/api/stats'],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Documents"
              value={stats?.totalDocuments || 0}
              icon={FileText}
              color="text-primary"
              loading={statsLoading}
            />
            <StatsCard
              title="Active Jobs"
              value={stats?.activeJobs || 0}
              icon={Briefcase}
              color="text-green-600"
              loading={statsLoading}
            />
            <StatsCard
              title="Matches Found"
              value={stats?.matchesFound || 0}
              icon={Users}
              color="text-green-500"
              loading={statsLoading}
            />
            <StatsCard
              title="Processing"
              value={stats?.processing || 0}
              icon={Clock}
              color="text-orange-500"
              loading={statsLoading}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-material-1 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FileText className="text-primary mr-2" />
                Upload Documents
              </h2>
              
              <UploadArea
                type="job_description"
                title="Job Description"
                description="Drop your job description here or click to upload"
              />

              <UploadArea
                type="consultant_profile"
                title="Consultant Profiles"
                description="Upload consultant profiles (bulk supported)"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-material-1 p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <History className="text-primary mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="text-center py-4 text-gray-500">
                  <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <AnalysisResults />
        </div>

        {/* Document Table */}
        <DocumentTable />
      </main>

      {/* Floating Action Button */}
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-material-3 hover:shadow-lg transition-all duration-200"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
