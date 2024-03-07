import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Access the postId from the request query parameters
    // Parse the request body as JSON
    const postId = params.id;

    // Retrieve all comments for the specified post from the database
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
    });

    return new NextResponse(JSON.stringify(comments), { status: 200 });
  } catch (error: any) {
    // Handle errors if necessary
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  /* try {
    // Access the commentId from the request query parameters
    const commentId = request.query.commentId as string;

    // Delete the comment from the database
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return new NextResponse('Comment deleted successfully', { status: 200 });
  } catch (error: any) {
    // Handle errors if necessary
    return new NextResponse(error.message, { status: 500 });
  } */
}
