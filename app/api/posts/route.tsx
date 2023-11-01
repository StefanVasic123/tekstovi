import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RequestBody {
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string;
}

export async function GET(request: Request) {
  const genre = request.url.split('?')[1]?.split('=')[1]; // Extract the 'genre' query parameter

  let posts;

  if (genre) {
    posts = await prisma.post.findMany({
      where: {
        genre: genre,
      },
    });
  } else {
    posts = await prisma.post.findMany();
  }

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        genre: body.genre,
        date: body.date,
        voiceCover: body.voiceCover,
      },
    });

    const { ...result } = post;

    return new NextResponse(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse('User with email already exists', {
        status: 409,
      });
    }
    return new NextResponse(error.message, { status: 500 });
  }
}
