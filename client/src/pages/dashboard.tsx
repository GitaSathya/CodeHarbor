
import { FileText, Briefcase, Users, Clock, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DocumentStats, Document } from "@shared/schema";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import UploadArea from "@/components/upload-area";
import AnalysisResults from "@/components/analysis-results";
import DocumentTable from "@/components/document-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: stats, isLoading: statsLoading } = useQuery<DocumentStats>({
    queryKey: ['/api/stats'],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const jobDescriptions = documents.filter(doc => doc.type === 'job_description' && doc.status === 'completed');
  const selectedJob = jobDescriptions.find(job => job.id === selectedJobId);

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

              {/* Job Selection for Applicant Profiles */}
              {jobDescriptions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job for Applicant Profiles
                  </label>
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job description..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobDescriptions.map(job => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.name.replace(/\.(pdf|docx?|txt)$/i, '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <UploadArea
                type="consultant_profile"
                title="Applicant Profiles"
                description={selectedJob 
                  ? `Upload applicant profiles for: ${selectedJob.name.replace(/\.(pdf|docx?|txt)$/i, '')}`
                  : "Upload applicant profiles (bulk supported, ZIP files accepted)"
                }
                selectedJobId={selectedJobId}
                disabled={!selectedJobId}
              />

              {jobDescriptions.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Getting Started:</strong> Upload a job description first, then upload applicant profiles for that specific job.
                  </p>
                </div>
              )}
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


    </div>
  );
}
