import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Retrieve all comments for the specified post from the database
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
    });

    // Fetch all replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await prisma.reply.findMany({
          where: {
            commentId: comment.id,
          },
        });
        return { ...comment, replies };
      })
    );

    return new NextResponse(JSON.stringify(commentsWithReplies), {
      status: 200,
    });
  } catch (error: any) {
    // Handle errors if necessary
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Access the postId, userId, content, and commentId from the request body
    const { id, userId, content, commentId } = body;
    // Check if the user is logged in
    if (!userId) {
      return new NextResponse('User not authenticated', { status: 401 });
    }
    console.log(id, userId, content, commentId);

    // Create the reply in the database
    const reply = await prisma.reply.create({
      data: {
        id,
        userId,
        content,
        commentId,
      },
    });

    return new NextResponse(JSON.stringify(reply), { status: 200 });
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
