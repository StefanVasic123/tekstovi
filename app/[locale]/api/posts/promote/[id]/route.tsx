import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const queryParams = new URLSearchParams(request.url.split('?')[1] || '');
    const durationQuery: string | number | null = queryParams.get('duration');

    // Calculate the expiration date based on the selected duration
    const expiresAt = new Date(Date.now() + Number(durationQuery));

    // Check if a promotion with the given postId already exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        postId: postId,
      },
    });

    let promotion;

    if (existingPromotion) {
      // If a promotion already exists, update it
      promotion = await prisma.promotion.update({
        where: {
          id: existingPromotion.id,
        },
        data: {
          expires_at: expiresAt,
        },
      });
    } else {
      // If no promotion exists, create a new one
      promotion = await prisma.promotion.create({
        data: {
          postId: postId,
          promoted: true,
          datePromoted: new Date(),
          expires_at: expiresAt,
        },
      });
    }

    return new NextResponse(JSON.stringify(promotion), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
