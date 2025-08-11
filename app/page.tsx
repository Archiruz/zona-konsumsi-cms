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
          <p className="mt-4 text-lg">Loading...</p>
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
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Office Consumption Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your office inventory with our comprehensive CMS. 
            Track consumption, manage limits, and ensure efficient resource allocation 
            with QR code scanning and automated tracking.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => router.push("/auth/signin")}>
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
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
              <CardTitle>QR Code Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quick and easy item tracking with QR code technology
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based access control for admins and employees
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive tracking and reporting capabilities
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Inventory Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time inventory management and limit enforcement
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">How It Works</CardTitle>
            <CardDescription>
              Simple steps to manage your office consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Admin Setup</h3>
                <p className="text-gray-600">
                  Administrators create consumption types and add items with limits
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Employee Access</h3>
                <p className="text-gray-600">
                  Employees scan QR codes to take items within their limits
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Track & Monitor</h3>
                <p className="text-gray-600">
                  Real-time tracking and automated limit enforcement
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
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of offices already using our CMS
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In Now
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
            Smart office consumption management made simple
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Zona Konsumsi CMS. All rights reserved. Made with ❤️ by Alvian.
          </p>
        </div>
      </footer>
    </div>
  );
}
