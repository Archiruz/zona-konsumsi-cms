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
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
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

    setIsUploading(true);

    try {
      // For now, we'll create a data URL (in production, you'd upload to a service like Cloudinary)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onChange(result);
        setIsUploading(false);
        toast.success("Photo uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload photo");
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const handleRemovePhoto = () => {
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

      {/* File Upload */}
      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
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

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}
