"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Maximize2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeProps {
  value: string;
  itemName: string;
  size?: number;
  onView?: () => void;
}

export function QRCode({ value, itemName, size = 128, onView }: QRCodeProps) {
  const [isVisible, setIsVisible] = useState(true);

  const downloadQRCode = () => {
    try {
      const canvas = document.createElement("canvas");
      const svg = document.querySelector(`[data-qr-id="${value}"] svg`);
      
      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          
          const link = document.createElement("a");
          link.download = `qr-${itemName.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          
          toast.success("QR code downloaded successfully");
        }
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        {isVisible ? (
          <div 
            data-qr-id={value}
            className="border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:border-gray-300 transition-colors"
            onClick={onView}
            title="Click to view full size"
          >
            <QRCodeSVG
              value={value}
              size={size}
              level="M"
              includeMargin={true}
            />
          </div>
        ) : (
          <div className="w-32 h-32 border border-gray-200 rounded-lg p-2 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm text-center">
              QR Hidden
            </span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center space-x-1 h-7 px-2"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-3 w-3" />
              <span className="text-xs">Hide</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span className="text-xs">Show</span>
            </>
          )}
        </Button>
        
        {isVisible && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex items-center space-x-1 h-7 px-2"
              title="View full size"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="text-xs">View</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex items-center space-x-1 h-7 px-2"
              title="Download QR code"
            >
              <Download className="h-3 w-3" />
              <span className="text-xs">Save</span>
            </Button>
          </>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center max-w-32">
        {itemName}
      </div>
    </div>
  );
}
