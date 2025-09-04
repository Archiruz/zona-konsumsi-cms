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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Edit, Trash2, Search, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";

interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function DepartmentManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
      toast.error("Akses ditolak. Diperlukan hak akses admin.");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "ADMIN" && mounted && hasInitialData && (pagination.page > 1 || searchTerm)) {
      const hasActiveFilters = searchTerm;
      const isPageChange = pagination.page > 1;
      
      if (hasActiveFilters || isPageChange) {
        fetchDepartments();
      }
    }
  }, [session, pagination.page, searchTerm, mounted, hasInitialData]);

  useEffect(() => {
    if (session?.user.role === "ADMIN" && mounted && !hasInitialData) {
      fetchDepartments();
    }
  }, [session, mounted, hasInitialData]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      const response = await fetch(`/api/departments?${params}`);
      if (response.ok) {
        const result = await response.json();
        setDepartments(result.data);
        setPagination(result.pagination);
        setHasInitialData(true);
      } else {
        toast.error("Gagal mengambil data departemen");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nama departemen diperlukan");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Departemen berhasil dibuat!");
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal membuat departemen");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Departemen berhasil diperbarui!");
        setShowEditModal(false);
        setSelectedDepartment(null);
        setFormData({ name: "", description: "" });
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal memperbarui departemen");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Departemen berhasil dihapus!");
        setShowDeleteModal(false);
        setSelectedDepartment(null);
        fetchDepartments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus departemen");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!mounted || !dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal Tidak Valid";
      }
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Tanggal Tidak Valid";
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
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
                Manajemen Departemen
              </h1>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Departemen</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Departemen
          </h2>
          <p className="text-gray-600">
            Buat, edit, dan kelola departemen dalam organisasi
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departemen</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                Departemen terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tim</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {departments.reduce((sum, dept) => sum + dept.users.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Orang tim dalam departemen
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata per Departemen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pagination.totalCount > 0 
                  ? Math.round(departments.reduce((sum, dept) => sum + dept.users.length, 0) / pagination.totalCount)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Orang tim per departemen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari departemen..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Departemen</CardTitle>
            <CardDescription>
              Kelola departemen dalam organisasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !hasInitialData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat departemen...</p>
              </div>
            ) : (
              <>
                {isLoading && hasInitialData && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Menyegarkan...</span>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Departemen</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Jumlah Tim</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{department.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {department.description || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {department.users.length} orang tim
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(department.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(department)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(department)}
                              disabled={department.users.length > 0}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {departments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          {searchTerm ? "Tidak ada departemen yang ditemukan sesuai pencarian Anda." : "Tidak ada departemen yang ditemukan."}
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
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Buat Departemen Baru</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Departemen</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Membuat..." : "Buat Departemen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Departemen</h3>
            <form onSubmit={handleEditDepartment} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Departemen</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Memperbarui..." : "Perbarui Departemen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Modal */}
      {showDeleteModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Hapus Departemen</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus departemen <strong>{selectedDepartment.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            {selectedDepartment.users.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Departemen ini memiliki {selectedDepartment.users.length} pengguna. 
                  Pindahkan atau hapus pengguna terlebih dahulu sebelum menghapus departemen.
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteDepartment}
                disabled={isLoading || selectedDepartment.users.length > 0}
                className="flex-1"
              >
                {isLoading ? "Menghapus..." : "Hapus Departemen"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
