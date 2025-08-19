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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, purchaseDate, photo, consumptionTypeId, stock } = body;

    if (!name || !consumptionTypeId || !purchaseDate) {
      return NextResponse.json(
        { error: "Name, type, and purchase date are required" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.consumptionItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
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
            reason: "Manual adjustment by admin",
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
      { error: "Failed to update consumption item" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.consumptionItem.delete({ where: { id } });

    return NextResponse.json({ message: "Consumption item deleted successfully" });
  } catch (error) {
    console.error("Error deleting consumption item:", error);
    return NextResponse.json(
      { error: "Failed to delete consumption item" },
      { status: 500 }
    );
  }
}
