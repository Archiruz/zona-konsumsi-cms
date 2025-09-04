import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Scan QR code untuk mendapatkan informasi item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "ID Item diperlukan" },
        { status: 400 }
      );
    }

    const item = await prisma.consumptionItem.findUnique({
      where: { id: itemId },
      include: {
        consumptionType: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memindai kode QR" },
      { status: 500 }
    );
  }
}
