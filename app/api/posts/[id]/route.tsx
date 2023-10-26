import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    return new NextResponse('No post with ID found', { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  let json = await request.json();

  const updated_post = await prisma.post.update({
    where: { id },
    data: json,
  });
  if (!updated_post) {
    return new NextResponse('No post with ID found', { status: 404 });
  }

  return NextResponse.json(updated_post);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.post.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return new NextResponse('No post with ID found', { status: 404 });
    }

    return new NextResponse(error.message, { status: 500 });
  }
}
