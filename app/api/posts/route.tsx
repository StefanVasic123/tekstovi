import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const POSTS_PER_PAGE = 20;

interface RequestBody {
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string;
  author: object;
  authorId: any;
}

export async function GET(request: Request) {
  const queryParams = new URLSearchParams(request.url.split('?')[1] || '');
  const genre: any = queryParams.get('genre');
  const gender: any = queryParams.get('gender');
  const wishlist = queryParams.get('wishlist');
  const postsPagination = queryParams.get('postsPagination');
  const isAdminRequest = request.headers.get('x-admin-request') === 'true';
  const authorId = queryParams.get('authorId');

  let posts: any;
  // Filter by genre
  const page = parseInt(postsPagination || '1', 10);
  const offset = (page - 1) * POSTS_PER_PAGE;

  if (isAdminRequest) {
    // If the request is coming from the admin page, fetch all posts
    console.log('AUTHOR_ID: ', authorId);
    if (!authorId) {
      posts = [];
    } else {
      posts = await prisma.post.findMany({
        where: { authorId: authorId },
      });
    }
  } else if (wishlist && (genre || gender)) {
    // Fetch wishlist posts and filter by genre or gender
    const wishlistItems = JSON.parse(wishlist);
    posts = await prisma.post.findMany({
      where: {
        id: {
          in: wishlistItems,
        },
        ...(genre && { genre: genre }), // Include genre if it exists
        ...(gender && { gender: gender }), // Include gender if it exists
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  } else if (wishlist) {
    // Fetch wishlist posts
    const wishlistItems = JSON.parse(wishlist);
    posts = await prisma.post.findMany({
      where: {
        id: {
          in: wishlistItems,
        },
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  } else if (genre && gender) {
    // Filter by both genre and gender
    posts = await prisma.post.findMany({
      where: {
        genre: genre,
        gender: gender,
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  } else if (genre) {
    // Filter by genre
    posts = await prisma.post.findMany({
      where: {
        genre: genre,
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  } else if (gender) {
    // Filter by gender
    posts = await prisma.post.findMany({
      where: {
        gender: gender,
      },
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  } else {
    // Fetch all posts
    posts = await prisma.post.findMany({
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  }

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    // Retrieve the maximum listPlaceId from existing items
    const maxListPlaceId = await prisma.post.findFirst({
      select: {
        listPlaceId: true,
      },
      orderBy: {
        listPlaceId: 'desc',
      },
    });

    // Calculate the new listPlaceId (incremented by 1)
    const newListPlaceId = maxListPlaceId ? maxListPlaceId.listPlaceId + 1 : 1;

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        genre: body.genre,
        date: body.date,
        voiceCover: body.voiceCover,
        listPlaceId: newListPlaceId,
        authorId: body.authorId,
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
