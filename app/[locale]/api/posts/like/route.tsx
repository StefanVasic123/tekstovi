import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Access the postId and userId from the request body
    const { postId, userId } = body;

    // Check if the user is logged in
    if (!userId) {
      return new NextResponse('User not authenticated', { status: 401 });
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    // Variable to store the updated post
    let updatedPost;

    if (existingLike) {
      // If the like record exists, delete it using its id
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Decrement the like count for the post
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });
    } else {
      // If the user has not liked the post, create a new like for the post
      await prisma.like.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });

      // Increment the like count for the post
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
    }

    return new NextResponse(JSON.stringify(updatedPost), { status: 200 });
  } catch (error: any) {
    // Handle errors if necessary
    return new NextResponse(error.message, { status: 500 });
  }
}
