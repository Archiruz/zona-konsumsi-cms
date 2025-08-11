"use client";

import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  itemName: string;
}

export function PhotoViewer({ isOpen, onClose, photoUrl, itemName }: PhotoViewerProps) {
  if (!isOpen) return null;

  const downloadPhoto = () => {
    try {
      const link = document.createElement("a");
      link.href = photoUrl;
      link.download = `photo-${itemName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      link.click();
      toast.success("Photo downloaded successfully");
    } catch (error) {
      toast.error("Failed to download photo");
    }
  };

  const openInNewTab = () => {
    try {
      window.open(photoUrl, '_blank');
    } catch (error) {
      toast.error("Unable to open photo in new tab");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Photo: {itemName}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center mb-4">
          <img
            src={photoUrl}
            alt={itemName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1MEgxNTBWMTUwSDUwVjUwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHN2ZyB4PSI3NSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPgo8cGF0aCBkPSJNMTUuNSA2aC03YTQgNCAwIDAgMC00IDR2OGE0IDQgMCAwIDAgNCA0aDhhNCA0IDAgMCAwIDQtNHYtOGE0IDQgMCAwIDAtNC00aC03Ii8+Cjwvc3ZnPgo8L3N2Zz4K";
              toast.error("Failed to load photo");
            }}
          />
        </div>
        
        <div className="flex justify-center space-x-2">
          <Button
            onClick={downloadPhoto}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={openInNewTab}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in New Tab</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
