
import { FileText, Upload, Trash2, Eye, Download, Filter } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your job descriptions and consultant profiles</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Documents</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Input 
                placeholder="Search documents..." 
                className="max-w-sm"
              />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job">Job Descriptions</SelectItem>
                  <SelectItem value="consultant">Consultant Profiles</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileText className="w-8 h-8 text-primary" />
                  <Badge 
                    variant={
                      doc.status === 'Processed' ? 'default' :
                      doc.status === 'Processing' ? 'secondary' : 'destructive'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {doc.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{doc.type}</span>
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
                <div className="flex justify-between mt-4 pt-3 border-t">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
