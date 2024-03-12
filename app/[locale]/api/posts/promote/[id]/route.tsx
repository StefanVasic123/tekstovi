import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const promotion = await prisma.promotion.create({
      data: {
        postId: id,
        promoted: true,
        datePromoted: new Date(),
      },
    });

    return new NextResponse(JSON.stringify(promotion), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
