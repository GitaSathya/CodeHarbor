
import { useState } from 'react';
import { FileText, Users, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UploadAreaProps {
  type: 'job_description' | 'consultant_profile';
  title: string;
  description: string;
  selectedJobId?: string;
  disabled?: boolean;
}

export default function UploadArea({ type, title, description, selectedJobId, disabled = false }: UploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onSuccess: async (uploadedDoc) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      setIsUploading(false);
      
      if (Array.isArray(uploadedDoc.documents)) {
        toast({
          title: "ZIP file processed",
          description: `Successfully uploaded ${uploadedDoc.documents.length} files`,
        });
      } else {
        toast({
          title: "Upload successful",
          description: `${uploadedDoc.name} uploaded successfully`,
        });
      }
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) {
      toast({
        title: "Upload disabled",
        description: type === 'consultant_profile' ? "Please upload a job description first" : "Upload is currently disabled",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate({ 
        file, 
        type, 
        jobDescriptionId: type === 'consultant_profile' ? selectedJobId : undefined 
      });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
    },
    multiple: type === 'consultant_profile',
    disabled: disabled || isUploading,
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
            : disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-primary'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <Icon className={`text-4xl mb-2 mx-auto ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {isUploading ? 'Uploading...' : disabled ? 'Upload a job description first' : description}
        </p>
        <p className={`text-xs mt-1 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
          Supports PDF, DOC, TXT, ZIP
        </p>
      </div>
    </div>
  );
}
