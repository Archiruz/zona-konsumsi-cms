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
    const { name, description, limit, period } = body;

    if (!name || !limit || !period) {
      return NextResponse.json(
        { error: "Nama, batas, dan periode harus diisi" },
        { status: 400 }
      );
    }

    const updatedType = await prisma.consumptionType.update({
      where: { id },
      data: {
        name,
        description,
        limit: parseInt(limit),
        period,
      },
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error("Error updating consumption type:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui tipe konsumsi" },
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

    await prisma.consumptionType.delete({ where: { id } });

    return NextResponse.json({ message: "Tipe konsumsi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting consumption type:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tipe konsumsi" },
      { status: 500 }
    );
  }
}
