import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const POSTS_PER_PAGE = 20;

interface RequestBody {
  title: string;
  content: string;
  genre: string;
  gender: string;
  language: string;
  role: string;
  date: string;
  voiceCover: string;
  author: object;
  authorId: any;
}

export async function GET(request: Request) {
  try {
    // Extract language from the URL path
    const language = request.url.split('/')[3]; // Assuming language is the first part of the path

    const queryParams = new URLSearchParams(request.url.split('?')[1] || '');
    const genre: any = queryParams.get('genre');
    const gender: any = queryParams.get('gender');
    const wishlist = queryParams.get('wishlist');
    const postsPagination = queryParams.get('postsPagination');
    const isAdminRequest = request.headers.get('x-admin-request') === 'true';
    const authorId = queryParams.get('authorId');
    const search = queryParams.get('search');

    let posts: any;
    const page = parseInt(postsPagination || '1', 10);
    const offset = (page - 1) * POSTS_PER_PAGE;

    const includeAuthor = {
      author: {
        select: {
          name: true,
        },
      },
    };

    const includeComments = {
      comments: {
        select: {
          id: true,
        },
      },
    };

    const includePromotion = {
      promotion: true, // Include the promotion field
    };

    let searchCondition: any = {};

    if (search) {
      searchCondition = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (isAdminRequest) {
      if (!authorId) {
        posts = [];
      } else {
        posts = await prisma.post.findMany({
          where: { authorId: authorId },
        });
      }
    } else if (wishlist && (genre || gender)) {
      const wishlistItems = JSON.parse(wishlist);
      posts = await prisma.post.findMany({
        where: {
          id: {
            in: wishlistItems,
          },
          ...(genre && { genre: genre }),
          ...(gender && { gender: gender }),
          ...searchCondition,
          ...(language && { language: language }), // Filter by language if provided
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments },
      });
    } else if (wishlist) {
      const wishlistItems = JSON.parse(wishlist);
      posts = await prisma.post.findMany({
        where: {
          id: {
            in: wishlistItems,
          },
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments },
      });
    } else if (genre && gender) {
      posts = await prisma.post.findMany({
        where: {
          genre: genre,
          gender: gender,
          ...(language && { language: language }), // Filter by language if provided
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments, ...includePromotion },
      });
    } else if (genre) {
      posts = await prisma.post.findMany({
        where: {
          genre: genre,
          ...(language && { language: language }), // Filter by language if provided
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments, ...includePromotion },
      });
    } else if (gender) {
      posts = await prisma.post.findMany({
        where: {
          gender: gender,
          ...(language && { language: language }), // Filter by language if provided
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments, ...includePromotion },
      });
    } else {
      posts = await prisma.post.findMany({
        where: {
          ...(search !== null && search !== '' && searchCondition), // Include search condition if exists
          ...(language && { language: language }), // Filter by language if provided
        },
        take: POSTS_PER_PAGE,
        skip: offset,
        include: { ...includeAuthor, ...includeComments, ...includePromotion },
      });
    }

    posts = posts.map((post: any) => ({
      ...post,
      commentCount: post?.comments?.length,
    }));

    return NextResponse.json(posts);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
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
        gender: body.gender,
        language: body.language,
        role: body.role,
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
