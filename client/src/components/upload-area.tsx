import { Upload, FileText, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadAreaProps {
  type: 'job_description' | 'consultant_profile';
  title: string;
  description: string;
}

export default function UploadArea({ type, title, description }: UploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await apiRequest('POST', '/api/documents/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Upload successful",
        description: "Document has been uploaded and processed.",
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync(file);
      }
    } finally {
      setIsUploading(false);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: type === 'consultant_profile',
  });

  const Icon = type === 'job_description' ? FileText : Users;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-300 hover:border-primary'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <Icon className="text-gray-400 text-4xl mb-2 mx-auto" />
        <p className="text-sm text-gray-600">
          {isUploading ? 'Uploading...' : description}
        </p>
        <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, TXT</p>
      </div>
    </div>
  );
}
