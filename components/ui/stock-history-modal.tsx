"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Calendar, User, ChevronsRight } from "lucide-react";

interface StockAdjustment {
  id: string;
  change: number;
  reason: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
}

export function StockHistoryModal({ isOpen, onClose, itemId, itemName }: StockHistoryModalProps) {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchHistory();
    }
  }, [isOpen, itemId, pagination.page]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      const response = await fetch(`/api/stock-adjustments/${itemId}?${params}`);
      if (response.ok) {
        const result = await response.json();
        setAdjustments(result.data);
        setPagination(result.pagination);
      } else {
        toast.error("Failed to fetch stock history");
      }
    } catch (error) {
      toast.error("An error occurred while fetching stock history");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span>Stock History: {itemName}</span>
          </DialogTitle>
          <DialogDescription>
            A log of all stock adjustments for this item.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading && adjustments.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading history...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(adj.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{adj.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={adj.change > 0 ? "default" : "destructive"}>
                          {adj.change > 0 ? `+${adj.change}` : adj.change}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal break-words">
                        <div className="flex items-center space-x-2">
                          <ChevronsRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span>{adj.reason || "-"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {adjustments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No stock adjustments found for this item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
