import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const { name, description, purchaseDate, photo, typeId, quantity } = body;

    if (!name || !typeId || !quantity || !purchaseDate) {
      return NextResponse.json(
        { error: "Name, type, quantity, and purchase date are required" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.consumptionItem.update({
      where: { id },
      data: {
        name,
        description,
        purchaseDate: new Date(purchaseDate),
        photo,
        typeId,
        quantity: parseInt(quantity),
      },
      include: {
        type: true,
      },
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

    await prisma.consumptionItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Consumption item deleted successfully" });
  } catch (error) {
    console.error("Error deleting consumption item:", error);
    return NextResponse.json(
      { error: "Failed to delete consumption item" },
      { status: 500 }
    );
  }
}
