import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua item konsumsi dengan pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const consumptionTypeId = searchParams.get('consumptionTypeId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search and filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (consumptionTypeId) {
      where.consumptionTypeId = consumptionTypeId;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.consumptionItem.count({ where });
    
    // Get paginated results
    const items = await prisma.consumptionItem.findMany({
      where,
      include: {
        consumptionType: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: items,
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
      { error: "Failed to fetch consumption items" },
      { status: 500 }
    );
  }
}

// POST - Buat item konsumsi baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, purchaseDate, photo, consumptionTypeId, stock } = body;

    if (!name || !consumptionTypeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const initialStock = stock ? parseInt(stock) : 0;

    const item = await prisma.consumptionItem.create({
      data: {
        name,
        description,
        purchaseDate: new Date(purchaseDate),
        photo,
        consumptionTypeId,
        stock: initialStock,
      },
      include: {
        consumptionType: true,
      },
    });

    if (initialStock > 0) {
      await prisma.stockAdjustment.create({
        data: {
          itemId: item.id,
          change: initialStock,
          reason: "Initial stock",
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create consumption item" },
      { status: 500 }
    );
  }
}
