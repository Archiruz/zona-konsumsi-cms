"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function PhotoUpload({ value, onChange, label = "Photo", placeholder = "Enter photo URL or upload file" }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [uploadController, setUploadController] = useState<AbortController | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create abort controller for canceling upload
    const controller = new AbortController();
    setUploadController(controller);
    setUploadingFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Vercel Blob storage with progress tracking
      const formData = new FormData();
      formData.append("file", file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Set up abort signal
      controller.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // Promise wrapper for XMLHttpRequest
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error("Invalid response format"));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || "Upload failed"));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      const result = await uploadPromise;
      setPreviewUrl(result.url);
      onChange(result.url);
      setUploadProgress(100);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error && error.message === "Upload cancelled") {
        toast.info("Upload cancelled");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to upload photo");
      }
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      setUploadController(null);
      setUploadingFile(null);
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const handleCancelUpload = () => {
    if (uploadController) {
      uploadController.abort();
    }
  };

  const handleRemovePhoto = async () => {
    // If it's a blob URL, we could optionally clean it up
    // Note: Vercel Blob free tier auto-cleans unused files after 30 days
    if (previewUrl && previewUrl.includes('blob.vercel-storage.com')) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(previewUrl)}`, {
          method: "DELETE",
        });
      } catch (error) {
        // Silently handle cleanup errors as they're not critical
        console.log("Cleanup note:", error);
      }
    }

    onChange("");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openPhoto = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="photo">{label}</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Input
          id="photo"
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Enter a photo URL or upload a file below
        </p>
      </div>

      {/* File Upload with Drag & Drop */}
      <div className="space-y-2">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <Upload className={`h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="text-sm">
              <span className={`font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                {isDragOver ? 'Drop your image here' : 'Click to upload or drag and drop'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Photo Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Photo preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPhoto}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Full Size</span>
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadingFile && (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {/* File Info Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-700">Uploading {uploadingFile.name}</span>
                <span className="text-xs text-blue-600">
                  {(uploadingFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelUpload}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Cancel upload"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ease-out ${
                uploadProgress === 100 
                  ? 'bg-green-500' 
                  : uploadProgress > 50 
                  ? 'bg-blue-600' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          
          {/* Status Text */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600">
              {uploadProgress < 100 ? "Uploading to Vercel Blob Storage..." : "Upload complete!"}
            </span>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <span className="text-blue-500">
                {uploadProgress < 50 ? "Initializing..." : "Almost done..."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
