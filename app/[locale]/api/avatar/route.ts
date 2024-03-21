import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename: any = searchParams.get('filename');
  const userId: any = searchParams.get('userId');

  try {
    // Upload the file blob and get the URL
    const blob = await put(filename, request.body as any, {
      access: 'public',
    });

    // Update user's image field with the blob URL
    await prisma.user.update({
      where: { id: userId },
      data: { image: blob.url },
    });

    // Fetch the updated user object from the database
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Return the updated user object with the blob URL in the image field
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
