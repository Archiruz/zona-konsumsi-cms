import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua record konsumsi dengan pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const userIdParam = searchParams.get('userId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search and filtering
    const where: any = {};
    
    // Apply user scoping rules
    if (userIdParam) {
      // If userId is provided, ensure non-admins can only query themselves
      if (session.user.role !== "ADMIN" && userIdParam !== session.user.id) {
        return NextResponse.json(
          { error: "Akses ditolak" },
          { status: 403 }
        );
      }
      where.userId = userIdParam;
    } else if (session.user.role !== "ADMIN") {
      // Non-admins are always restricted to their own records
      where.userId = session.user.id;
    }
    
    if (search) {
      where.OR = [
        { item: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    // Get total count for pagination
    const totalCount = await prisma.consumptionRecord.count({ where });
    
    // Get paginated results
    const records = await prisma.consumptionRecord.findMany({
      where,
      include: {
        user: true,
        item: {
          include: {
            consumptionType: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        date: 'desc',
      },
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: records,
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
      { error: "Gagal mengambil data record konsumsi" },
      { status: 500 }
    );
  }
}

// POST - Buat record konsumsi baru (pengambilan item)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, quantity, photo, notes } = body;

    if (!itemId || !quantity || !photo) {
      return NextResponse.json(
        { error: "Field yang diperlukan tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek apakah item masih tersedia
    const item = await prisma.consumptionItem.findUnique({
      where: { id: itemId },
      include: { consumptionType: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item tidak ditemukan" },
        { status: 404 }
      );
    }

    if (item.stock < quantity) {
      return NextResponse.json(
        { error: "Stok tidak mencukupi" },
        { status: 400 }
      );
    }

    // Cek batas pengambilan berdasarkan periode
    const now = new Date();
    let startDate: Date;
    
    if (item.consumptionType.period === "WEEKLY") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const userRecords = await prisma.consumptionRecord.findMany({
      where: {
        userId: session.user.id,
        itemId: itemId,
        date: {
          gte: startDate,
        },
      },
    });

    const totalTaken = userRecords.reduce((sum, record) => sum + record.quantity, 0);
    
    if (totalTaken + quantity > item.consumptionType.limit) {
      return NextResponse.json(
        { error: `Melebihi batas ${item.consumptionType.limit} per ${item.consumptionType.period.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Create consumption record and update stock in a transaction
    const [record] = await prisma.$transaction([
      prisma.consumptionRecord.create({
        data: {
          userId: session.user.id,
          itemId: itemId,
          quantity: quantity,
          photo: photo,
          notes: notes,
        },
        include: {
          user: true,
          item: {
            include: {
              consumptionType: true,
            },
          },
        },
      }),
      prisma.consumptionItem.update({
        where: { id: itemId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      }),
    ]);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat record konsumsi" },
      { status: 500 }
    );
  }
}
