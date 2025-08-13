"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit, Package, X, Search, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { QRCode } from "@/components/ui/qr-code";
import { QRCodeModal } from "@/components/ui/qr-code-modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { PhotoViewer } from "@/components/ui/photo-viewer";

interface ConsumptionType {
  id: string;
  name: string;
  period: "WEEKLY" | "MONTHLY";
}

interface ConsumptionItem {
  id: string;
  name: string;
  description?: string;
  purchaseDate: string;
  photo?: string;
  consumptionType: ConsumptionType;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Items() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ConsumptionItem[]>([]);
  const [types, setTypes] = useState<ConsumptionType[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsumptionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    purchaseDate: "",
    photo: "",
    consumptionTypeId: "",
  });
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [selectedItemForQrCode, setSelectedItemForQrCode] = useState<ConsumptionItem | null>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "ADMIN" && mounted) {
      fetchItems();
      fetchTypes();
    }
  }, [session, mounted]);

  useEffect(() => {
    if (mounted && session?.user.role === "ADMIN") {
      fetchItems();
    }
  }, [pagination.page, searchTerm, selectedTypeId, mounted, session]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      if (selectedTypeId && selectedTypeId !== "all") {
        params.append('consumptionTypeId', selectedTypeId);
      }
      
      const response = await fetch(`/api/consumption-items?${params}`);
      if (response.ok) {
        const result = await response.json();
        setItems(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error("Failed to fetch items");
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/consumption-types");
      if (response.ok) {
        const result = await response.json();
        setTypes(result.data);
      }
    } catch (error) {
      toast.error("Failed to fetch consumption types");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      purchaseDate: "",
      photo: "",
      consumptionTypeId: "",
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: ConsumptionItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      purchaseDate: item.purchaseDate.split('T')[0], // Format date for input
      photo: item.photo || "",
      consumptionTypeId: item.consumptionType.id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingItem 
        ? `/api/consumption-items/${editingItem.id}`
        : "/api/consumption-items";
      
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (response.ok) {
        const message = editingItem 
          ? "Item updated successfully"
          : "Item created successfully";
        toast.success(message);
        resetForm();
        // Reset to first page when adding/editing
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchItems();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${editingItem ? 'update' : 'create'} item`);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/consumption-items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Item deleted successfully");
        fetchItems();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete item");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const handleTypeFilter = (typeId: string) => {
    setSelectedTypeId(typeId);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const generateAllQRCodes = async () => {
    try {
      // For now, we'll show a message about the feature
      // In a full implementation, you could use a library like JSZip to create a zip file
      toast.success("QR codes are now visible in the table. You can download individual QR codes using the download button on each one.");
    } catch (error) {
      toast.error("Failed to generate QR codes");
    }
  };

  const printAllQRCodes = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to print QR codes");
        return;
      }

      const qrCodesHTML = items.map(item => `
        <div style="display: inline-block; margin: 10px; text-align: center; page-break-inside: avoid;">
          <div style="border: 1px solid #ccc; padding: 10px; background: white;">
            <div id="qr-${item.id}"></div>
            <div style="margin-top: 5px; font-size: 12px; font-weight: bold;">${item.name}</div>
            <div style="font-size: 10px; color: #666;">ID: ${item.id}</div>
          </div>
        </div>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Codes - ${items.length} Items</title>
          <script src="https://unpkg.com/qrcode.react@3.1.0/lib/index.umd.js"></script>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1 class="no-print">QR Codes for ${items.length} Items</h1>
          <p class="no-print">Print this page to get all QR codes for easy scanning</p>
          <button class="no-print" onclick="window.print()">Print</button>
          <div style="text-align: center;">
            ${qrCodesHTML}
          </div>
          <script>
            // Generate QR codes after page loads
            window.onload = function() {
              ${items.map(item => `
                const qrContainer = document.getElementById('qr-${item.id}');
                if (qrContainer) {
                  const qr = new QRCode(qrContainer, {
                    text: '${item.id}',
                    width: 128,
                    height: 128,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                  });
                }
              `).join('')}
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      toast.success("Print window opened. Generate QR codes and print them.");
    } catch (error) {
      toast.error("Failed to open print window");
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted || !dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user.role !== "ADMIN") {
    return null;
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
                Manage Consumption Items
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Consumption Items
              </h2>
              <p className="text-gray-600">
                Manage the items available for consumption
              </p>
            </div>
            <Button
              onClick={() => {
                if (editingItem) {
                  resetForm();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center space-x-2"
            >
              {editingItem ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add New Item</span>
                </>
              )}
            </Button>
            
            {!editingItem && !showForm && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={generateAllQRCodes}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Generate All QR Codes</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={printAllQRCodes}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Print All QR Codes</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={selectedTypeId}
                onValueChange={handleTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingItem ? "Edit Consumption Item" : "Add New Consumption Item"}
              </CardTitle>
              <CardDescription>
                {editingItem 
                  ? "Update the item details"
                  : "Create a new item with its details and type"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Coffee Beans"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consumptionTypeId">Consumption Type</Label>
                    <Select
                      value={formData.consumptionTypeId}
                      onValueChange={(value) => setFormData({ ...formData, consumptionTypeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.period.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <PhotoUpload
                    value={formData.photo}
                    onChange={(value) => setFormData({ ...formData, photo: value })}
                    label="Photo (Optional)"
                    placeholder="Enter photo URL or upload file"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading 
                      ? (editingItem ? "Updating..." : "Creating...")
                      : (editingItem ? "Update Item" : "Create Item")
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
            <CardDescription>
              All consumption items and their details. QR codes contain the item ID for quick scanning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{item.consumptionType.name}</span>
                        <span className="text-xs text-gray-500">
                          ({item.consumptionType.period.toLowerCase()})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(item.purchaseDate)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell>
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="h-10 w-10 object-cover rounded-full cursor-pointer" onClick={() => {
                          if (item.photo) {
                            setSelectedPhoto({ url: item.photo, name: item.name });
                            setPhotoViewerOpen(true);
                          }
                        }} />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full text-gray-500 cursor-pointer" onClick={() => {
                          setSelectedPhoto({ url: "", name: "No Photo" });
                          setPhotoViewerOpen(true);
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M15.5 6h-7a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4h-7"/></svg>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <QRCode 
                        value={item.id} 
                        itemName={item.name}
                        size={80}
                        onView={() => {
                          setSelectedItemForQrCode(item);
                          setQrCodeModalOpen(true);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {searchTerm || selectedTypeId !== "all" ? "No items found matching your criteria." : "No items found. Create your first one above."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </main>

      <QRCodeModal
        isOpen={qrCodeModalOpen}
        onClose={() => setQrCodeModalOpen(false)}
        value={selectedItemForQrCode?.id || ""}
        itemName={selectedItemForQrCode?.name || ""}
      />

      <PhotoViewer
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        photoUrl={selectedPhoto?.url || ""}
        itemName={selectedPhoto?.name || ""}
      />
    </div>
  );
}
