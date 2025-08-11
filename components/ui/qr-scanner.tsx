"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Dynamically import html5-qrcode to avoid SSR issues
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (!scannerRef.current) return;

      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        await html5QrCodeRef.current.start(
          { deviceId: { exact: cameras[0].id } },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            // Successfully scanned
            toast.success("QR Code scanned successfully!");
            onScan(decodedText);
            stopScanning();
          },
          (errorMessage: string) => {
            // Scanning error (not a fatal error)
            console.log("Scanning error:", errorMessage);
          }
        );
      } else {
        throw new Error("No cameras found");
      }
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(err.message || "Failed to start camera");
      setIsScanning(false);
      
      if (err.message?.includes("Permission")) {
        toast.error("Camera permission denied. Please allow camera access.");
      } else if (err.message?.includes("No cameras")) {
        toast.error("No cameras found on this device.");
      } else {
        toast.error("Failed to start camera scanner.");
      }
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {!isScanning ? (
            <div className="text-center">
              <div className="mb-4">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">
                Click the button below to start scanning QR codes with your camera
              </p>
              <Button
                onClick={startScanning}
                className="flex items-center space-x-2"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                <span>Start Camera Scanner</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Point your camera at a QR code
                </p>
                <p className="text-sm text-gray-500">
                  The scanner will automatically detect and read QR codes
                </p>
              </div>
              
              <div className="flex justify-center">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full max-w-md"
                ></div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={stopScanning}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Stop Scanner</span>
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-600 text-xs mt-1">
                Try refreshing the page or checking your camera permissions.
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>Make sure you have a working camera and have granted camera permissions.</p>
            <p>QR codes should contain the item ID for quick scanning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
