"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Trash2, Edit, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";

interface ConsumptionType {
  id: string;
  name: string;
  description?: string;
  limit: number;
  period: "WEEKLY" | "MONTHLY";
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

export default function ConsumptionTypes() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [editingType, setEditingType] = useState<ConsumptionType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    limit: "",
    period: "WEEKLY" as "WEEKLY" | "MONTHLY"
  });

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
      fetchTypes();
    }
  }, [session, mounted]);

  useEffect(() => {
    if (mounted && session?.user.role === "ADMIN") {
      fetchTypes();
    }
  }, [pagination.page, searchTerm, mounted, session]);

  const fetchTypes = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      const response = await fetch(`/api/consumption-types?${params}`);
      if (response.ok) {
        const result = await response.json();
        setTypes(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error("Gagal mengambil jenis konsumsi");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", limit: "", period: "WEEKLY" });
    setEditingType(null);
    setShowForm(false);
  };

  const handleEdit = (type: ConsumptionType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      limit: type.limit.toString(),
      period: type.period
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingType 
        ? `/api/consumption-types/${editingType.id}`
        : "/api/consumption-types";
      
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          limit: parseInt(formData.limit),
        }),
      });

      if (response.ok) {
        const message = editingType 
          ? "Jenis konsumsi berhasil diperbarui"
          : "Jenis konsumsi berhasil dibuat";
        toast.success(message);
        resetForm();
        // Reset to first page when adding/editing
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTypes();
      } else {
        const error = await response.json();
        toast.error(error.error || `Gagal ${editingType ? 'memperbarui' : 'membuat'} jenis konsumsi`);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (typeId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jenis konsumsi ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      const response = await fetch(`/api/consumption-types/${typeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Jenis konsumsi berhasil dihapus");
        fetchTypes();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus jenis konsumsi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const formatDate = (dateString: string) => {
    if (!mounted || !dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal Tidak Valid";
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Tanggal Tidak Valid";
    }
  };

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Memuat...</p>
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
                Kembali
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Kelola Jenis Konsumsi
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
                Jenis Konsumsi
              </h2>
              <p className="text-gray-600">
                Kelola jenis dan batasan item konsumsi
              </p>
            </div>
            <Button
              onClick={() => {
                if (editingType) {
                  resetForm();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center space-x-2"
            >
              {editingType ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Batal Edit</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tambah Jenis Baru</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari jenis..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingType ? "Edit Jenis Konsumsi" : "Tambah Jenis Konsumsi Baru"}
              </CardTitle>
              <CardDescription>
                {editingType 
                  ? "Perbarui detail jenis konsumsi"
                  : "Buat jenis konsumsi baru dengan batasannya"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      placeholder="contoh: Snack Mingguan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit">Batas per Periode</Label>
                    <Input
                      id="limit"
                      type="number"
                      placeholder="contoh: 5"
                      value={formData.limit}
                      onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period">Periode</Label>
                    <Select
                      value={formData.period}
                      onValueChange={(value: "WEEKLY" | "MONTHLY") =>
                        setFormData({ ...formData, period: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Mingguan</SelectItem>
                        <SelectItem value="MONTHLY">Bulanan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Input
                      id="description"
                      placeholder="contoh: Snack dan minuman"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading 
                      ? (editingType ? "Memperbarui..." : "Membuat...")
                      : (editingType ? "Perbarui Jenis" : "Buat Jenis")
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jenis yang Ada</CardTitle>
            <CardDescription>
              Semua jenis konsumsi dan batasannya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Batas</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || "-"}</TableCell>
                    <TableCell>{type.limit}</TableCell>
                    <TableCell className="capitalize">{type.period === "WEEKLY" ? "Mingguan" : "Bulanan"}</TableCell>
                    <TableCell>
                      {formatDate(type.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {types.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {searchTerm ? "Tidak ada jenis yang cocok dengan pencarian Anda." : "Tidak ada jenis konsumsi ditemukan. Buat yang pertama di atas."}
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
    </div>
  );
}
