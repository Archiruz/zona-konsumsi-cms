"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Edit, Trash2, Search, Users, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  nip?: string;
  position?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastLogin?: string;
}

interface Department {
  id: string;
  name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
    nip: "",
    position: "",
    departmentId: ""
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
      // Only fetch if we actually have meaningful changes, not just component re-renders
      const hasActiveFilters = searchTerm;
      const isPageChange = pagination.page > 1;
      
      if (hasActiveFilters || isPageChange) {
        fetchUsers();
      }
    }
  }, [session, pagination.page, searchTerm, mounted, hasInitialData]);

  useEffect(() => {
    if (session?.user.role === "ADMIN" && mounted && !hasInitialData) {
      fetchUsers();
      fetchDepartments();
    }
  }, [session, mounted, hasInitialData]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
        setPagination(result.pagination);
        setHasInitialData(true); // Mark data as fetched
      } else {
        toast.error("Gagal mengambil data pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments?limit=1000"); // Get all departments
      if (response.ok) {
        const result = await response.json();
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Mohon isi semua kolom yang diperlukan");
      return;
    }

    // Validate NIP if provided
    if (formData.nip && !/^\d{9}$/.test(formData.nip)) {
      toast.error("NIP harus berupa 9 digit angka");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          nip: formData.nip || null,
          position: formData.position || null,
          departmentId: formData.departmentId || null,
        }),
      });

      if (response.ok) {
        toast.success("Pengguna berhasil dibuat!");
        setShowCreateModal(false);
        setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", nip: "", position: "", departmentId: "" });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal membuat pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Validate NIP if provided
    if (formData.nip && !/^\d{9}$/.test(formData.nip)) {
      toast.error("NIP harus berupa 9 digit angka");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          nip: formData.nip || null,
          position: formData.position || null,
          departmentId: formData.departmentId || null,
          ...(formData.password && { password: formData.password })
        }),
      });

      if (response.ok) {
        toast.success("Pengguna berhasil diperbarui!");
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", nip: "", position: "", departmentId: "" });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal memperbarui pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pengguna berhasil dihapus!");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus pengguna");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      nip: user.nip || "",
      position: user.position || "",
      departmentId: user.departmentId || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
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

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "ADMIN" ? "destructive" : "default"}>
        {role === "ADMIN" ? "admin" : "tim zona"}
      </Badge>
    );
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
                Manajemen Pengguna
              </h1>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Pengguna</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Pengguna
          </h2>
          <p className="text-gray-600">
            Buat, edit, dan kelola akun pengguna serta perizinan
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                Semua pengguna terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === "ADMIN").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengguna administratif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tim Zona</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === "EMPLOYEE").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengguna tim ZMG
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.lastLogin).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengguna dengan aktivitas login
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pengguna</CardTitle>
            <CardDescription>
              Kelola akun pengguna, peran, dan perizinan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !hasInitialData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat pengguna...</p>
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
                      <TableHead>Pengguna</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Login Terakhir</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.nip || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.position || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.department?.name || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.lastLogin ? formatDate(user.lastLogin) : "Belum Pernah"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              disabled={user.id === session?.user.id}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              disabled={user.id === session?.user.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          {searchTerm ? "Tidak ada pengguna yang ditemukan sesuai pencarian Anda." : "Tidak ada pengguna yang ditemukan."}
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-6">Buat Pengguna Baru</h3>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Peran</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "ADMIN" | "EMPLOYEE") => 
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Karyawan</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nip">NIP (9 digit, opsional)</Label>
                    <Input
                      id="nip"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="123456789"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Posisi (opsional)</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Contoh: Manager, Staff, dll"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Departemen (opsional)</Label>
                    <Select
                      value={formData.departmentId || "none"}
                      onValueChange={(value) => 
                        setFormData({ ...formData, departmentId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada departemen</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Membuat..." : "Buat Pengguna"}
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

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-6">Edit Pengguna</h3>
            <form onSubmit={handleEditUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nama</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">Kata Sandi (kosongkan jika tidak ingin mengubah)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Peran</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "ADMIN" | "EMPLOYEE") => 
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Karyawan</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-nip">NIP (9 digit, opsional)</Label>
                    <Input
                      id="edit-nip"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="123456789"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-position">Posisi (opsional)</Label>
                    <Input
                      id="edit-position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Contoh: Manager, Staff, dll"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-department">Departemen (opsional)</Label>
                    <Select
                      value={formData.departmentId || "none"}
                      onValueChange={(value) => 
                        setFormData({ ...formData, departmentId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada departemen</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Memperbarui..." : "Perbarui Pengguna"}
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

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Hapus Pengguna</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus <strong>{selectedUser.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Menghapus..." : "Hapus Pengguna"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
