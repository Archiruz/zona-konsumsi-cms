"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Calendar, User, Package, Search, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { PhotoViewer } from "@/components/ui/photo-viewer";

interface ConsumptionRecord {
  id: string;
  quantity: number;
  photo: string;
  notes?: string;
  date: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  item: {
    id: string;
    name: string;
    description?: string;
    consumptionType: {
      id: string;
      name: string;
      period: "WEEKLY" | "MONTHLY";
      limit: number;
    };
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface WeeklySummary {
  totalItems: number;
  totalQuantity: number;
  itemsByType: {
    [key: string]: {
      name: string;
      count: number;
      quantity: number;
      limit: number;
      period: "WEEKLY" | "MONTHLY";
    };
  };
}

export default function Records() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string } | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    totalItems: 0,
    totalQuantity: 0,
    itemsByType: {},
  });
  const [hasInitialData, setHasInitialData] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && mounted) {
      fetchRecords();
      if (!isAdmin) {
        fetchConsumptionTypes();
      }
    }
  }, [session, mounted]);

  useEffect(() => {
    if (records.length > 0) {
      calculateWeeklySummary();
    }
  }, [records]);

  useEffect(() => {
    if (session && mounted && hasInitialData && (pagination.page > 1 || searchTerm || startDate || endDate)) {
      // Only fetch if we actually have meaningful changes, not just component re-renders
      const hasActiveFilters = searchTerm || startDate || endDate;
      const isPageChange = pagination.page > 1;
      
      if (hasActiveFilters || isPageChange) {
        fetchRecords();
      }
    }
  }, [pagination.page, searchTerm, startDate, endDate, hasInitialData]);

  const getCurrentWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const setCurrentWeekFilter = () => {
    const weekRange = getCurrentWeekRange();
    setStartDate(weekRange.start);
    setEndDate(weekRange.end);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      const response = await fetch(`/api/consumption-records?${params}`);
      if (response.ok) {
        const result = await response.json();
        setRecords(result.data);
        setPagination(result.pagination);
        setHasInitialData(true);
      } else {
        toast.error("Gagal mengambil catatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsumptionTypes = async () => {
    try {
      const response = await fetch("/api/consumption-types");
      if (response.ok) {
        const result = await response.json();
        // Update weekly summary with limit information
        setWeeklySummary(prev => {
          const updated = { ...prev };
          result.data.forEach((type: any) => {
            if (updated.itemsByType[type.id]) {
              updated.itemsByType[type.id].limit = type.limit;
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to fetch consumption types:", error);
    }
  };

  const calculateWeeklySummary = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyRecords = records.filter(record => {
      try {
        const recordDate = new Date(record.date);
        return recordDate >= startOfWeek && recordDate <= now;
      } catch {
        return false;
      }
    });

    const summary: WeeklySummary = {
      totalItems: weeklyRecords.length,
      totalQuantity: weeklyRecords.reduce((sum, record) => sum + record.quantity, 0),
      itemsByType: {},
    };

    // Group by consumption type
    weeklyRecords.forEach(record => {
      const typeId = record.item.consumptionType.id;
      const typeName = record.item.consumptionType.name;
      const period = record.item.consumptionType.period;
      const limit = record.item.consumptionType.limit;
      
      if (!summary.itemsByType[typeId]) {
        summary.itemsByType[typeId] = {
          name: typeName,
          count: 0,
          quantity: 0,
          limit: limit,
          period,
        };
      }
      
      summary.itemsByType[typeId].count += 1;
      summary.itemsByType[typeId].quantity += record.quantity;
    });

    setWeeklySummary(summary);
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
      return "Invalid Date";
    }
  };

  const getPeriodBadge = (period: string) => {
    return (
      <Badge variant={period === "WEEKLY" ? "default" : "secondary"}>
        {period === "WEEKLY" ? "Mingguan" : "Bulanan"}
      </Badge>
    );
  };

  const getWeeklyProgress = (typeId: string) => {
    const type = weeklySummary.itemsByType[typeId];
    if (!type || type.limit === 0) return null;
    
    const percentage = Math.min((type.quantity / type.limit) * 100, 100);
    const isOverLimit = type.quantity > type.limit;
    
    return { percentage, isOverLimit };
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const handleDateFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
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

  const isAdmin = session?.user.role === "ADMIN";

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
                {isAdmin ? "Semua Catatan Konsumsi" : "Catatan Konsumsi Saya"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Riwayat Konsumsi
          </h2>
          <p className="text-gray-600">
            {isAdmin 
              ? "Lihat semua catatan konsumsi dari semua pengguna"
              : "Lihat riwayat konsumsi pribadi Anda"
            }
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari catatan..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={setCurrentWeekFilter}
                className="whitespace-nowrap"
              >
                Minggu Ini
              </Button>
              <Input
                type="date"
                placeholder="Tanggal Mulai"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="Tanggal Akhir"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
              <Button
                variant="outline"
                onClick={handleDateFilter}
                className="whitespace-nowrap"
              >
                Filter
              </Button>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Catatan</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Semua pengguna" : "Catatan Anda"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklySummary.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Item diambil minggu ini
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(record => {
                  try {
                    const recordDate = new Date(record.date);
                    if (isNaN(recordDate.getTime())) return false;
                    const now = new Date();
                    return recordDate.getMonth() === now.getMonth() && 
                           recordDate.getFullYear() === now.getFullYear();
                  } catch {
                    return false;
                  }
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Catatan bulan ini
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Item Diambil</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.reduce((sum, record) => sum + record.quantity, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total konsumsi diambil
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary Section */}
        {!isAdmin && (
          <>
            {weeklySummary.totalItems > 0 ? (
              <>
                {/* Weekly Status Overview */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Ringkasan Status Mingguan</span>
                    </CardTitle>
                    <CardDescription>
                      Ringkasan cepat konsumsi Anda minggu ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{weeklySummary.totalItems}</div>
                        <div className="text-sm text-blue-600 font-medium">Item Diambil</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{weeklySummary.totalQuantity}</div>
                        <div className="text-sm text-green-600 font-medium">Total Kuantitas</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">
                          {Object.keys(weeklySummary.itemsByType).length}
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Jenis Digunakan</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.values(weeklySummary.itemsByType).filter(type => 
                            type.limit > 0 && type.quantity >= type.limit * 0.8
                          ).length}
                        </div>
                        <div className="text-sm text-orange-600 font-medium">Mendekati Batas</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Minggu berlangsung dari {getCurrentWeekRange().start} sampai {getCurrentWeekRange().end}
                        </span>
                        <span>
                          {(() => {
                            const now = new Date();
                            const endOfWeek = new Date(now);
                            endOfWeek.setDate(now.getDate() - now.getDay() + 6);
                            endOfWeek.setHours(23, 59, 59, 999);
                            const timeLeft = endOfWeek.getTime() - now.getTime();
                            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                            return `${daysLeft} hari tersisa`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Weekly Summary */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Rincian Detail berdasarkan Jenis</span>
                    </CardTitle>
                    <CardDescription>
                      Rincian per item dengan batasan dan progres
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(weeklySummary.itemsByType).map(([typeId, type]) => {
                        const progress = getWeeklyProgress(typeId);
                        const remaining = type.limit > 0 ? Math.max(0, type.limit - type.quantity) : null;
                        const isOverLimit = type.limit > 0 && type.quantity > type.limit;
                        
                        return (
                          <div key={typeId} className={`border rounded-lg p-4 space-y-3 ${isOverLimit ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{type.name}</h4>
                              <Badge variant={type.period === "WEEKLY" ? "default" : "secondary"}>
                                {type.period === "WEEKLY" ? "Mingguan" : "Bulanan"}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Diambil:</span>
                                <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
                                  {type.quantity}
                                </span>
                              </div>
                              
                              {type.limit > 0 && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Batas:</span>
                                    <span className="font-medium">{type.limit}</span>
                                  </div>
                                  
                                  {remaining !== null && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Sisa:</span>
                                      <span className={`font-medium ${remaining === 0 ? 'text-orange-600' : remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {progress && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Progres</span>
                                        <span className={`font-medium ${progress.isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                                          {progress.percentage.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-300 ${
                                            progress.isOverLimit 
                                              ? 'bg-red-500' 
                                              : progress.percentage >= 80 
                                              ? 'bg-orange-500' 
                                              : 'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                                        />
                                      </div>
                                      {progress.isOverLimit && (
                                        <p className="text-xs text-red-600 font-medium">
                                          Melebihi batas sebesar {type.quantity - type.limit}
                                        </p>
                                      )}
                                      {!progress.isOverLimit && progress.percentage >= 80 && (
                                        <p className="text-xs text-orange-600 font-medium">
                                          Mendekati batas
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* No Weekly Records Message */
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Ringkasan Mingguan</span>
                  </CardTitle>
                  <CardDescription>
                    Lacak konsumsi dan batasan mingguan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada item yang diambil minggu ini</h3>
                    <p className="text-gray-600 mb-4">
                      Anda belum mengambil item konsumsi minggu ini. 
                      Batasan mingguan Anda akan ditampilkan di sini setelah Anda mulai mengkonsumsi item.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-blue-900 mb-2">Cara kerjanya:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Batasan mingguan direset setiap hari Minggu</li>
                        <li>• Batasan bulanan direset pada tanggal 1 setiap bulan</li>
                        <li>• Anda akan melihat progress bar dan kuantitas yang tersisa</li>
                        <li>• Item yang melebihi batas akan disorot dengan warna merah</li>
                        <li>• Item yang mendekati batas akan ditampilkan dengan warna oranye</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Catatan</CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? "Semua catatan konsumsi dari semua pengguna"
                    : "Catatan konsumsi pribadi Anda"
                  }
                </CardDescription>
              </div>
              {isLoading && hasInitialData && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Memperbarui...</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && !hasInitialData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat catatan...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && <TableHead>Pengguna</TableHead>}
                      <TableHead>Item</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Kuantitas</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Foto</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{record.user.name}</div>
                                <div className="text-sm text-gray-500">{record.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{record.item.name}</div>
                              {record.item.description && (
                                <div className="text-sm text-gray-500">{record.item.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getPeriodBadge(record.item.consumptionType.period)}
                            <span className="text-sm">{record.item.consumptionType.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {record.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formatDate(record.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.photo ? (
                            <div className="flex flex-col items-center space-y-2">
                              <img
                                src={record.photo}
                                alt="Foto bukti"
                                className="h-10 w-10 object-cover rounded-lg border border-gray-200 cursor-pointer"
                                onClick={() => {
                                  setSelectedPhoto({ 
                                    url: record.photo, 
                                    name: `${record.item.name} - ${record.user.name}` 
                                  });
                                  setPhotoViewerOpen(true);
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1MEgxNTBWMTUwSDUwVjUwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHN2ZyB4PSI3NSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPgo8cGF0aCBkPSJNMTUuNSA2aC03YTQgNCAwIDAgMC00IDR2OGE0IDQgMCAwIDAgNCA0aDhhNCA0IDAgMCAwIDQtNHYtOGE0IDQgMCAwIDAtNC00aC03Ii8+Cjwvc3ZnPgo8L3N2Zz4K";
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPhoto({ 
                                    url: record.photo, 
                                    name: `${record.item.name} - ${record.user.name}` 
                                  });
                                  setPhotoViewerOpen(true);
                                }}
                                className="flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Lihat</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada foto</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {record.notes ? (
                              <span className="text-sm text-gray-600">{record.notes}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {records.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-gray-500 py-8">
                          {searchTerm || startDate || endDate ? "Tidak ada catatan yang cocok dengan kriteria Anda." : "Tidak ada catatan konsumsi ditemukan."}
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

      {/* Photo Viewer */}
      {selectedPhoto && (
        <PhotoViewer
          isOpen={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          photoUrl={selectedPhoto.url}
          itemName={selectedPhoto.name}
        />
      )}
    </div>
  );
}
