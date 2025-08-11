"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, QrCode, Camera, Package, X } from "lucide-react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { QRScanner } from "@/components/ui/qr-scanner";

interface ConsumptionItem {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  quantity: number;
  type: {
    id: string;
    name: string;
    limit: number;
    period: "WEEKLY" | "MONTHLY";
  };
}

export default function ScanQR() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scannedItem, setScannedItem] = useState<ConsumptionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "1",
    notes: "",
    photo: ""
  });
  const [qrInput, setQrInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [hasScannedCode, setHasScannedCode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleQRScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Please enter a QR code or item ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/scan-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: qrInput.trim() }),
      });

      if (response.ok) {
        const item = await response.json();
        setScannedItem(item);
        setShowForm(true);
        toast.success("Item found! Please fill in the details below.");
      } else {
        const error = await response.json();
        toast.error(error.error || "Item not found");
      }
    } catch (error) {
      toast.error("Failed to scan QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScannerResult = (result: string) => {
    setQrInput(result);
    setHasScannedCode(true);
    setShowScanner(false);
    toast.success("QR Code scanned! Click 'Submit' to continue.");
  };

  const handleManualSubmit = () => {
    if (!qrInput.trim()) {
      toast.error("Please enter a QR code or item ID");
      return;
    }
    handleQRScan();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedItem) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/consumption-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: scannedItem.id,
          quantity: parseInt(formData.quantity),
          photo: formData.photo,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success("Item taken successfully!");
        setScannedItem(null);
        setShowForm(false);
        setFormData({ quantity: "1", notes: "", photo: "" });
        setQrInput("");
        setHasScannedCode(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to take item");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Scan QR Code
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Take Consumption Items
          </h2>
          <p className="text-gray-600">
            Scan a QR code or enter item ID to take items
          </p>
        </div>

        {/* QR Scanner Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <QrCode className="h-6 w-6" />
              <span>Scan QR Code</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter the QR code or item ID manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter QR code or item ID manually"
                value={qrInput}
                onChange={(e) => {
                  setQrInput(e.target.value);
                  if (e.target.value.trim()) {
                    setHasScannedCode(false); // Reset scan state when manually typing
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={hasScannedCode ? handleManualSubmit : () => setShowScanner(true)}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {hasScannedCode ? (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>{isLoading ? "Submitting..." : "Submit"}</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Scan QR Code</span>
                  </>
                )}
              </Button>
              {hasScannedCode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setHasScannedCode(false);
                    setQrInput("");
                  }}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {hasScannedCode 
                ? "QR code scanned! Click Submit to continue."
                : "Use the camera to scan a QR code or enter the code manually above."
              }
            </div>
          </CardContent>
        </Card>

        {/* Item Details and Form */}
        {scannedItem && showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>{scannedItem.name}</span>
              </CardTitle>
              <CardDescription>
                Fill in the details to take this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Item Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Available Quantity</Label>
                    <p className="text-lg font-semibold text-green-600">{scannedItem.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Type</Label>
                    <p className="text-lg font-semibold">{scannedItem.type.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Limit per {scannedItem.type.period.toLowerCase()}</Label>
                    <p className="text-lg font-semibold text-blue-600">{scannedItem.type.limit}</p>
                  </div>
                  {scannedItem.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <p className="text-sm text-gray-600">{scannedItem.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Take Item Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Take</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={scannedItem.quantity}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Maximum: {scannedItem.quantity}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <PhotoUpload
                    value={formData.photo}
                    onChange={(value) => setFormData({ ...formData, photo: value })}
                    label="Proof Photo (Required)"
                    placeholder="Upload photo or enter URL as proof"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading || !formData.photo}>
                    {isLoading ? "Taking Item..." : "Take Item"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setScannedItem(null);
                      setShowForm(false);
                      setFormData({ quantity: "1", notes: "", photo: "" });
                      setQrInput("");
                      setHasScannedCode(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!scannedItem && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Scan QR Code</h4>
                    <p className="text-sm text-gray-600">
                      Use your phone to scan the QR code on the item, or manually enter the item ID above.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Fill Details</h4>
                    <p className="text-sm text-gray-600">
                      Enter the quantity you want to take and any additional notes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Upload Photo</h4>
                    <p className="text-sm text-gray-600">
                      Take a photo as proof of taking the item. This is required.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Submit</h4>
                    <p className="text-sm text-gray-600">
                      Click "Take Item" to complete the process. The system will check your limits automatically.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScannerResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
