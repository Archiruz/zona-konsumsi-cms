import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua tipe konsumsi dengan pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const where: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};
    
    // Get total count for pagination
    const totalCount = await prisma.consumptionType.count({ where });
    
    // Get paginated results
    const types = await prisma.consumptionType.findMany({
      where,
      include: {
        items: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: types,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data tipe konsumsi" },
      { status: 500 }
    );
  }
}

// POST - Buat tipe konsumsi baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, limit, period } = body;

    if (!name || !limit || !period) {
      return NextResponse.json(
        { error: "Field yang diperlukan tidak lengkap" },
        { status: 400 }
      );
    }

    const type = await prisma.consumptionType.create({
      data: {
        name,
        description,
        limit,
        period,
      },
    });

    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat tipe konsumsi" },
      { status: 500 }
    );
  }
}
