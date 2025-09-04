"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, QrCode, Users, BarChart3 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Zona Konsumsi CMS
              </h1>
            </div>
            <Button onClick={() => router.push("/auth/signin")}>
              Masuk
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manajemen Konsumsi Kantor yang Cerdas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Kelola inventaris kantor Anda dengan CMS yang komprehensif. 
            Lacak konsumsi, kelola batasan, dan pastikan alokasi sumber daya yang efisien 
            dengan pemindaian QR code dan pelacakan otomatis.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => router.push("/auth/signin")}>
              Mulai Sekarang
            </Button>
            <Button variant="outline" size="lg">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Pemindaian QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pelacakan item yang cepat dan mudah dengan teknologi QR code
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Manajemen Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kontrol akses berbasis peran untuk admin dan karyawan
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analitik & Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kemampuan pelacakan dan pelaporan yang komprehensif
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Kontrol Inventaris</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manajemen inventaris real-time dan penegakan batasan
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Cara Kerjanya</CardTitle>
            <CardDescription>
              Langkah sederhana untuk mengelola konsumsi kantor Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Setup Admin</h3>
                <p className="text-gray-600">
                  Administrator membuat jenis konsumsi dan menambahkan item dengan batasan
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Akses Karyawan</h3>
                <p className="text-gray-600">
                  Karyawan memindai QR code untuk mengambil item dalam batasan mereka
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Lacak & Pantau</h3>
                <p className="text-gray-600">
                  Pelacakan real-time dan penegakan batasan otomatis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Siap untuk Memulai?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Bergabunglah dan rasakan kemudahan dalam mengelola konsumsi kantor Anda
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push("/auth/signin")}
              >
                Masuk Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-blue-400 mr-3" />
            <h3 className="text-xl font-bold">Zona Konsumsi CMS</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Manajemen konsumsi kantor yang cerdas dibuat sederhana
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Zona Konsumsi CMS. Semua hak dilindungi. Dibuat dengan ❤️ oleh Alvian.
          </p>
        </div>
      </footer>
    </div>
  );
}
