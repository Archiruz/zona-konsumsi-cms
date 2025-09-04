import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - Create a new stock adjustment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, change, reason } = body;

    if (!itemId || change === undefined) {
      return NextResponse.json(
        { error: "Field yang diperlukan tidak lengkap" },
        { status: 400 }
      );
    }

    const changeAmount = parseInt(change);
    if (isNaN(changeAmount)) {
      return NextResponse.json(
        { error: "Jumlah perubahan tidak valid" },
        { status: 400 }
      );
    }

    const item = await prisma.consumptionItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    if (item.stock + changeAmount < 0) {
      return NextResponse.json(
        { error: "Stok tidak boleh negatif" },
        { status: 400 }
      );
    }

    const [, stockAdjustment] = await prisma.$transaction([
      prisma.consumptionItem.update({
        where: { id: itemId },
        data: {
          stock: {
            increment: changeAmount,
          },
        },
      }),
      prisma.stockAdjustment.create({
        data: {
          itemId,
          change: changeAmount,
          reason,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json(stockAdjustment, { status: 201 });
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    return NextResponse.json(
      { error: "Gagal membuat penyesuaian stok" },
      { status: 500 }
    );
  }
}
