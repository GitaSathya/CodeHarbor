
import { FileText, Upload, Trash2, Eye, Download, Filter, FolderOpen, Briefcase, Users, CheckCircle, Play, Building } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document, Analysis } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useMemo } from 'react';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const { data: analyses = [] } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type, jobDescriptionId }: { file: File; type: string; jobDescriptionId?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (jobDescriptionId) {
        formData.append('jobDescriptionId', jobDescriptionId);
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Upload successful",
        description: "Document uploaded and processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewDocument = (doc: Document) => {
    toast({
      title: "Document preview",
      description: `Viewing ${doc.name} - Feature coming soon`,
    });
  };

  const handleDownloadDocument = (doc: Document) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.name} - Feature coming soon`,
    });
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      let type = "consultant_profile";
      const fileName = file.name.toLowerCase();

      if (fileName.includes('job') || fileName.includes('position') || fileName.includes('role')) {
        type = "job_description";
      }

      uploadMutation.mutate({ 
        file, 
        type, 
        jobDescriptionId: type === 'consultant_profile' ? selectedJobId : undefined 
      });
    });

    // Reset input
    event.target.value = '';
  };

  // Prepare data
  const jobDescriptions = documents.filter(doc => doc.type === 'job_description');
  const applicantProfiles = documents.filter(doc => doc.type === 'consultant_profile');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearchTerm = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const docTypeDisplay = doc.type === 'job_description' ? 'Job Description' : 'Applicant Profile';
      const matchesFilterType = filterType === 'all' || docTypeDisplay === filterType;
      const matchesJobFilter = selectedJobId === '' || doc.jobDescriptionId === selectedJobId || doc.id === selectedJobId;
      return matchesSearchTerm && matchesFilterType && matchesJobFilter;
    });
  }, [documents, searchTerm, filterType, selectedJobId]);

  const jobsTableData = jobDescriptions.map((job) => {
    const relatedAnalysis = analyses.find(analysis => analysis.jobDescriptionId === job.id);
    const jobApplicants = applicantProfiles.filter(profile => profile.jobDescriptionId === job.id);
    const shortlistedCount = relatedAnalysis?.results && Array.isArray(relatedAnalysis.results) ? relatedAnalysis.results.length : 0;

    return {
      id: job.id,
      jobTitle: relatedAnalysis?.jobTitle || job.name.replace(/\.(pdf|docx?|txt)$/i, ''),
      jobDescription: job.content.substring(0, 100) + (job.content.length > 100 ? '...' : ''),
      totalApplicants: jobApplicants.length,
      shortlistedApplicants: shortlistedCount,
      status: relatedAnalysis?.status || 'Not Analyzed',
      uploadDate: job.createdAt || job.uploadedAt,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Document Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage job descriptions and applicant profiles</p>
          </div>
          <div className="flex items-center space-x-4">
            {jobDescriptions.length > 0 && (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select job for applicant upload..." />
                </SelectTrigger>
                <SelectContent>
                  {jobDescriptions.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name.replace(/\.(pdf|docx?|txt)$/i, '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.zip"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Button className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="Job Description">Job Descriptions</SelectItem>
              <SelectItem value="Applicant Profile">Applicant Profiles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Analysis Table */}
        {jobsTableData.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span>Job Analysis Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Job Description</TableHead>
                      <TableHead className="text-center">Total Applicants</TableHead>
                      <TableHead className="text-center">Shortlisted</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Upload Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsTableData.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {job.jobTitle}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.jobDescription}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{job.totalApplicants}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-600">{job.shortlistedApplicants}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={
                              job.status === 'completed' ? 'default' : 
                              job.status === 'processing' ? 'secondary' : 'outline'
                            }
                          >
                            {job.status === 'completed' ? 'Analyzed' : 
                             job.status === 'processing' ? 'Processing' : 'Not Analyzed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {job.uploadDate ? new Date(job.uploadDate).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Grid */}
        {documentsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {documents.length === 0 
                ? "Get started by uploading your first job description."
                : "Try adjusting your search or filter criteria."
              }</p>
            <div className="relative inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.zip"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Your First Document</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => {
              const relatedJob = doc.jobDescriptionId ? jobDescriptions.find(job => job.id === doc.jobDescriptionId) : null;
              
              return (
                <Card key={doc.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                      <Badge 
                        variant={
                          doc.status === 'completed' ? 'default' : 
                          doc.status === 'processing' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {doc.status === 'completed' ? 'Processed' : 
                         doc.status === 'processing' ? 'Processing' : 'Failed'}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                      {doc.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">
                          {doc.type === 'job_description' ? 'Job Description' : 'Applicant Profile'}
                        </span>
                      </div>
                      {relatedJob && (
                        <div className="flex justify-between">
                          <span>Job:</span>
                          <span className="font-medium text-blue-600 truncate max-w-24" title={relatedJob.name}>
                            {relatedJob.name.replace(/\.(pdf|docx?|txt)$/i, '')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{(doc.createdAt || doc.uploadedAt) ? new Date(doc.createdAt || doc.uploadedAt!).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDocument(doc)}
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadDocument(doc)}
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete document"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
