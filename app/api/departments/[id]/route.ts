import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
            nip: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Departemen tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama departemen diperlukan" },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Departemen tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if name is already taken by another department
    const nameConflict = await prisma.department.findFirst({
      where: {
        name: name.trim(),
        id: { not: params.id },
      },
    });

    if (nameConflict) {
      return NextResponse.json(
        { error: "Departemen dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    // Update department
    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 401 });
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        users: true,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Departemen tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if department has users
    if (existingDepartment.users.length > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus departemen yang masih memiliki pengguna" },
        { status: 400 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Departemen berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}
