"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  itemName: string;
}

export function QRCodeModal({ isOpen, onClose, value, itemName }: QRCodeModalProps) {
  if (!isOpen) return null;

  const downloadQRCode = () => {
    try {
      const canvas = document.createElement("canvas");
      const svg = document.querySelector(`[data-modal-qr-id="${value}"] svg`);
      
      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, 0, 0, 400, 400);
          
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">QR Code: {itemName}</h3>
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
          <div 
            data-modal-qr-id={value}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <QRCodeSVG
              value={value}
              size={300}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Scan this QR code to quickly identify the item
          </p>
          <p className="text-xs text-gray-500 font-mono">
            ID: {value}
          </p>
        </div>
        
        <div className="flex justify-center space-x-2">
          <Button
            onClick={downloadQRCode}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download High Quality</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
