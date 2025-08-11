"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Calendar, User, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { PhotoViewer } from "@/components/ui/photo-viewer";

interface ConsumptionRecord {
  id: string;
  quantity: number;
  photo: string;
  notes?: string;
  takenAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  item: {
    id: string;
    name: string;
    description?: string;
    type: {
      id: string;
      name: string;
      period: "WEEKLY" | "MONTHLY";
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
    }
  }, [session, pagination.page, searchTerm, startDate, endDate, mounted]);

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
      } else {
        toast.error("Failed to fetch records");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getPeriodBadge = (period: string) => {
    return (
      <Badge variant={period === "WEEKLY" ? "default" : "secondary"}>
        {period.toLowerCase()}
      </Badge>
    );
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
          <p className="mt-4 text-lg">Loading...</p>
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
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin ? "All Consumption Records" : "My Consumption Records"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Consumption History
          </h2>
          <p className="text-gray-600">
            {isAdmin 
              ? "View all consumption records from all users"
              : "View your personal consumption history"
            }
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="End Date"
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
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "All users" : "Your records"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(record => {
                  const recordDate = new Date(record.takenAt);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Records this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items Taken</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.reduce((sum, record) => sum + record.quantity, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total quantity taken
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "All consumption records from all users"
                : "Your personal consumption records"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading records...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && <TableHead>User</TableHead>}
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Photo</TableHead>
                      <TableHead>Notes</TableHead>
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
                            {getPeriodBadge(record.item.type.period)}
                            <span className="text-sm">{record.item.type.name}</span>
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
                            <span className="text-sm">{formatDate(record.takenAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.photo ? (
                            <div className="flex items-center space-x-2">
                              <img
                                src={record.photo}
                                alt="Proof photo"
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
                                <span>View</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No photo</span>
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
                          {searchTerm || startDate || endDate ? "No records found matching your criteria." : "No consumption records found."}
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
