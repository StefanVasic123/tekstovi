import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const POSTS_PER_PAGE = 20;

interface RequestQuery {
  genre?: string;
  postsPagination?: string;
}

export async function GET(request: Request) {
  const queryParams = new URLSearchParams(request.url.split('?')[1] || '');
  const genre = queryParams.get('genre');
  const postsPagination = queryParams.get('postsPagination');
  const isAdminRequest = request.headers.get('x-admin-request') === 'true';

  let posts;
  if (isAdminRequest) {
    // If the request is coming from the admin page, fetch all posts
    posts = await prisma.post.findMany();
  } else if (genre) {
    // Filter by genre
    posts = await prisma.post.findMany({
      where: {
        genre: genre,
      },
    });
  } else {
    // Fetch paginated posts
    // if there is
    const page = parseInt(postsPagination || '1', 10);
    const offset = (page - 1) * POSTS_PER_PAGE;

    posts = await prisma.post.findMany({
      take: POSTS_PER_PAGE,
      skip: offset,
    });
  }

  return NextResponse.json(posts);
}
