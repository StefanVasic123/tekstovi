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

  let data = await request.json();

  try {
    // If data is an array of objects, update each item
    if (Array.isArray(data)) {
      const updatedItems = [];

      for (const item of data) {
        const updated_post = await prisma.post.update({
          where: { id: item.id },
          data: {
            listPlaceId: item.index,
          },
        });
        updatedItems.push(updated_post);
      }

      return NextResponse.json(updatedItems);
    } else {
      // If data is not an array, update a single item
      const updated_post = await prisma.post.update({
        where: { id },
        data,
      });

      return NextResponse.json(updated_post);
    }
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Delete associated promotions first
    await prisma.promotion.deleteMany({
      where: {
        postId: id,
      },
    });

    // Delete associated likes first
    await prisma.like.deleteMany({
      where: {
        postId: id,
      },
    });

    // Delete associated replies
    await prisma.reply.deleteMany({
      where: {
        comment: {
          postId: id,
        },
      },
    });

    // Delete associated comments
    await prisma.comment.deleteMany({
      where: {
        postId: id,
      },
    });

    // Then delete the post
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
