import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Access the postId, userId, and content from the request body
    const { postId, userId, content } = body;

    // Check if the user is logged in
    if (!userId) {
      return new NextResponse('User not authenticated', { status: 401 });
    }

    // Fetch the user's image URL
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        image: true,
      },
    });

    // Create the comment in the database
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        userImage: user?.image,
      },
    });

    return new NextResponse(JSON.stringify(comment), { status: 200 });
  } catch (error: any) {
    // Handle errors if necessary
    return new NextResponse(error.message, { status: 500 });
  }
}
