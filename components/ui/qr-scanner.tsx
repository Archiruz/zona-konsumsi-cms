"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, QrCode, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
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
      
      const availableCameras = await Html5Qrcode.getCameras();
      if (availableCameras && availableCameras.length > 0) {
        setCameras(availableCameras);
        
        // Try to find the back camera first
        let cameraToUse = availableCameras[0]; // fallback to first camera
        
        // Look for back camera by checking camera labels
        for (const camera of availableCameras) {
          if (camera.label.toLowerCase().includes('back') || 
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('environment') ||
              camera.label.toLowerCase().includes('world')) {
            cameraToUse = camera;
            break;
          }
        }
        
        // If we have multiple cameras and the first one seems to be front-facing, 
        // prefer the second one (often the back camera)
        if (availableCameras.length > 1 && 
            (availableCameras[0].label.toLowerCase().includes('front') || 
             availableCameras[0].label.toLowerCase().includes('user') ||
             availableCameras[0].label.toLowerCase().includes('selfie'))) {
          cameraToUse = availableCameras[1];
        }
        
        setSelectedCamera(cameraToUse);
        
        await html5QrCodeRef.current.start(
          { deviceId: { exact: cameraToUse.id } },
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

  const switchCamera = async (cameraId: string) => {
    if (isScanning) {
      stopScanning();
    }
    
    const camera = cameras.find(c => c.id === cameraId);
    if (camera) {
      setSelectedCamera(camera);
      // Auto-start scanning with new camera
      setTimeout(() => startScanning(), 100);
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
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
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <QrCode className="h-20 w-20 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                Click the button below to start scanning QR codes with your camera
              </p>
              <p className="text-sm text-gray-500 mb-4">
                The scanner will automatically try to use the back camera for better QR code scanning
              </p>
              <Button
                onClick={startScanning}
                className="flex items-center space-x-2 mx-auto"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                <span>Start Camera Scanner</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-3 text-lg font-medium">
                  Point your camera at a QR code
                </p>
                <p className="text-sm text-gray-500">
                  The scanner will automatically detect and read QR codes
                </p>
              </div>
              
              {/* Camera Selection */}
              {cameras.length > 1 && (
                <div className="flex flex-col items-center space-y-3">
                  <p className="text-sm text-gray-600">Select Camera:</p>
                  <Select value={selectedCamera?.id} onValueChange={switchCamera}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id.slice(0, 8)}...`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCamera && (
                    <p className="text-xs text-gray-500">
                      Using: {selectedCamera.label || `Camera ${selectedCamera.id.slice(0, 8)}...`}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-center">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full max-w-md"
                ></div>
              </div>

              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={stopScanning}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Stop Scanner</span>
                </Button>
                {cameras.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = cameras.findIndex(c => c.id === selectedCamera?.id);
                      const nextIndex = (currentIndex + 1) % cameras.length;
                      switchCamera(cameras[nextIndex].id);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Switch Camera</span>
                  </Button>
                )}
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

          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p className="mb-1">Make sure you have a working camera and have granted camera permissions.</p>
            <p>QR codes should contain the item ID for quick scanning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
