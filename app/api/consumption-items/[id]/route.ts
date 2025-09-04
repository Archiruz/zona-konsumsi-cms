import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, purchaseDate, photo, consumptionTypeId, stock } = body;

    if (!name || !consumptionTypeId || !purchaseDate) {
      return NextResponse.json(
        { error: "Nama, tipe, dan tanggal pembelian harus diisi" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.consumptionItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    const updatedStock = stock !== undefined ? parseInt(stock) : existingItem.stock;
    const stockChange = updatedStock - existingItem.stock;

    const [updatedItem] = await prisma.$transaction(async (tx) => {
      const item = await tx.consumptionItem.update({
        where: { id },
        data: {
          name,
          description,
          purchaseDate: new Date(purchaseDate),
          photo,
          consumptionTypeId,
          stock: updatedStock,
        },
        include: {
          consumptionType: true,
        },
      });

      if (stockChange !== 0) {
        await tx.stockAdjustment.create({
          data: {
            itemId: id,
            change: stockChange,
            reason: "Penyesuaian manual oleh admin",
            userId: session.user.id,
          },
        });
      }

      return [item];
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating consumption item:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui item konsumsi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.consumptionItem.delete({ where: { id } });

    return NextResponse.json({ message: "Item konsumsi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting consumption item:", error);
    return NextResponse.json(
      { error: "Gagal menghapus item konsumsi" },
      { status: 500 }
    );
  }
}
