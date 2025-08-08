import { FileText, Upload, Trash2, Eye, Download, Filter, FolderOpen } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect, useMemo } from 'react';

const mockDocuments = [
  {
    id: 1,
    name: "Senior React Developer.pdf",
    type: "Job Description",
    uploadDate: "2024-01-15",
    status: "Processed",
    size: "125 KB"
  },
  {
    id: 2,
    name: "John Doe Resume.pdf",
    type: "Consultant Profile",
    uploadDate: "2024-01-14",
    status: "Processing",
    size: "98 KB"
  },
  {
    id: 3,
    name: "Data Scientist Position.docx",
    type: "Job Description",
    uploadDate: "2024-01-13",
    status: "Processed",
    size: "76 KB"
  },
  {
    id: 4,
    name: "Jane Smith CV.pdf",
    type: "Consultant Profile",
    uploadDate: "2024-01-12",
    status: "Failed",
    size: "112 KB"
  }
];

export default function Documents() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleViewDocument = (doc) => {
    console.log(`Viewing document: ${doc.name}`);
    alert(`Viewing document: ${doc.name}`);
  };

  const handleDownloadDocument = (doc) => {
    console.log(`Downloading document: ${doc.name}`);
    alert(`Downloading document: ${doc.name}`);
  };

  const handleDeleteDocument = (id) => {
    console.log(`Deleting document with id: ${id}`);
    setDocuments(documents.filter(doc => doc.id !== id));
    alert(`Document with id ${id} deleted.`);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map((file, index) => {
      // Mocking upload process
      const reader = new FileReader();
      let fileType = "Unknown";
      if (file.type.includes("pdf")) fileType = "Job Description"; // Simplified type detection
      if (file.type.includes("document") || file.type.includes("wordprocessingml")) fileType = "Consultant Profile"; // Simplified type detection

      return {
        id: documents.length + index + 1,
        name: file.name,
        type: fileType,
        uploadDate: new Date().toISOString().split('T')[0],
        status: "Processing",
        size: (file.size / 1024).toFixed(0) + " KB"
      };
    });
    setDocuments([...documents, ...newDocuments]);
    alert(`Uploaded ${files.length} new document(s).`);
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearchTerm = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilterType = filterType === 'all' || doc.type === filterType;
      return matchesSearchTerm && matchesFilterType;
    });
  }, [documents, searchTerm, filterType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your job descriptions and consultant profiles</p>
          </div>
          <div className="relative inline-block">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </Button>
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
              <SelectItem value="Consultant Profile">Consultant Profiles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {documents.length === 0 
                ? "Get started by uploading your first job description or consultant profile."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            <div className="relative inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
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
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                    <Badge 
                      variant={
                        doc.status === 'Processed' ? 'default' : 
                        doc.status === 'Processing' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {doc.status}
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
                      <span className="font-medium">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{doc.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{doc.uploadDate}</span>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}