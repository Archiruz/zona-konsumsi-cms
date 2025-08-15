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
    const { name, description, limit, period } = body;

    if (!name || !limit || !period) {
      return NextResponse.json(
        { error: "Name, limit, and period are required" },
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
      { error: "Failed to update consumption type" },
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

    await prisma.consumptionType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Consumption type deleted successfully" });
  } catch (error) {
    console.error("Error deleting consumption type:", error);
    return NextResponse.json(
      { error: "Failed to delete consumption type" },
      { status: 500 }
    );
  }
}
