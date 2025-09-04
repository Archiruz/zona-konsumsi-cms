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
  stock: number;
  consumptionType: {
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleQRScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Silakan masukkan kode QR atau ID barang");
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
        toast.success("Barang ditemukan! Silakan isi detail di bawah ini.");
      } else {
        const error = await response.json();
        toast.error(error.error || "Barang tidak ditemukan");
      }
    } catch (error) {
      toast.error("Gagal memindai kode QR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScannerResult = (result: string) => {
    setQrInput(result);
    setShowScanner(false);
    toast.success("Kode QR berhasil dipindai! Klik 'Kirim' untuk melanjutkan.");
  };

  const handleManualSubmit = () => {
    if (!qrInput.trim()) {
      toast.error("Silakan masukkan kode QR atau ID barang");
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
        toast.success("Barang berhasil diambil!");
        setScannedItem(null);
        setShowForm(false);
        setFormData({ quantity: "1", notes: "", photo: "" });
        setQrInput("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal mengambil barang");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Memuat...</div>;
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
                Kembali
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Pindai Kode QR
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Ambil Barang Konsumsi
          </h2>
          <p className="text-gray-600">
            Pindai kode QR atau masukkan ID barang untuk mengambil barang
          </p>
        </div>

        {/* QR Scanner Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <QrCode className="h-6 w-6" />
              <span>Pindai Kode QR</span>
            </CardTitle>
            <CardDescription className="text-center">
              Masukkan kode QR atau ID barang secara manual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Masukkan kode QR atau ID barang secara manual"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={qrInput.trim() ? handleManualSubmit : () => setShowScanner(true)}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {qrInput.trim() ? (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>{isLoading ? "Mengirim..." : "Kirim"}</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Pindai Kode QR</span>
                  </>
                )}
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {qrInput.trim() 
                ? "Kode telah dimasukkan! Klik Kirim untuk melanjutkan."
                : "Gunakan kamera untuk memindai kode QR atau masukkan kode secara manual di atas."
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
                Isi detail untuk mengambil barang ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Item Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Stok Tersedia</Label>
                    <p className="text-lg font-semibold text-green-600">{scannedItem.stock}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Jenis</Label>
                    <p className="text-lg font-semibold">{scannedItem.consumptionType.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Batas per {scannedItem.consumptionType.period === 'WEEKLY' ? 'minggu' : 'bulan'}</Label>
                    <p className="text-lg font-semibold text-blue-600">{scannedItem.consumptionType.limit}</p>
                  </div>
                  {scannedItem.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
                      <p className="text-sm text-gray-600">{scannedItem.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Take Item Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah yang Diambil</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={scannedItem.stock}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Maksimum: {scannedItem.stock}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Catatan tambahan..."
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
                    label="Foto Bukti (Wajib)"
                    placeholder="Unggah foto atau masukkan URL sebagai bukti"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading || !formData.photo}>
                    {isLoading ? "Mengambil Barang..." : "Ambil Barang"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setScannedItem(null);
                      setShowForm(false);
                      setFormData({ quantity: "1", notes: "", photo: "" });
                      setQrInput("");
                    }}
                  >
                    Batal
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
              <CardTitle>Cara Penggunaan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Pindai Kode QR</h4>
                    <p className="text-sm text-gray-600">
                      Gunakan ponsel Anda untuk memindai kode QR pada barang, atau masukkan ID barang secara manual di atas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Isi Detail</h4>
                    <p className="text-sm text-gray-600">
                      Masukkan jumlah yang ingin diambil dan catatan tambahan jika ada.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Unggah Foto</h4>
                    <p className="text-sm text-gray-600">
                      Ambil foto sebagai bukti pengambilan barang. Ini wajib dilakukan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Kirim</h4>
                    <p className="text-sm text-gray-600">
                      Klik "Ambil Barang" untuk menyelesaikan proses. Sistem akan memeriksa batas pengambilan Anda secara otomatis.
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
