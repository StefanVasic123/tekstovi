import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

let POSTS_PER_PAGE = 20;
const POSTS_PER_DAY = 20;

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
    // Extract parameters from the request
    const {
      genre,
      gender,
      wishlist,
      postsPagination,
      search,
      isAdminRequest,
      authorId,
      language,
    } = extractParams(request);

    // Calculate pagination offset
    const page = parseInt(postsPagination || '1', 10);
    const offset = (page - 1) * POSTS_PER_PAGE;

    let posts: any[];

    // If it's an admin request and authorId exists, fetch posts related to authorId
    if (isAdminRequest && authorId) {
      posts = await prisma.post.findMany({
        where: {
          authorId: authorId,
        },
      });
    } else if (isAdminRequest) {
      // If it's an admin request but authorId is not provided, return empty array
      posts = [];
    } else {
      // Fetch both promoted and non-promoted posts
      const { promotedPosts, nonPromotedPosts } = await fetchPosts(
        genre,
        gender,
        wishlist,
        search,
        isAdminRequest,
        authorId,
        language,
        offset
      );

      // Concatenate promoted and non-promoted posts
      posts = [...promotedPosts, ...nonPromotedPosts];
    }
    // Transform posts data
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      commentCount: post?.comments?.length,
    }));

    return NextResponse.json(transformedPosts);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

async function fetchPosts(
  genre: string | null,
  gender: string | null,
  wishlist: string | null,
  search: string | null,
  isAdminRequest: boolean,
  authorId: string | null,
  language: string | null,
  offset: number
): Promise<{ promotedPosts: any[]; nonPromotedPosts: any[] }> {
  // Fetch promoted posts
  const promotedPosts = await fetchPromotedPosts(
    genre,
    gender,
    wishlist,
    search,
    language,
    offset
  );

  let nonPromotedPosts: any[] = [];

  // If there are fewer than POSTS_PER_PAGE promoted posts, fetch non-promoted posts to fill the remaining slots
  if (promotedPosts.length < POSTS_PER_PAGE) {
    nonPromotedPosts = await fetchNonPromotedPosts(
      genre,
      gender,
      wishlist,
      search,
      isAdminRequest,
      authorId,
      language,
      offset + promotedPosts.length,
      POSTS_PER_PAGE - promotedPosts.length
    );
  }

  return { promotedPosts, nonPromotedPosts };
}

async function fetchPromotedPosts(
  genre: string | null,
  gender: string | null,
  wishlist: string | null,
  search: string | null,
  language: string | null,
  offset: number
): Promise<any[]> {
  // Construct the include objects
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

  // Fetch promoted posts
  return await prisma.post.findMany({
    where: {
      promotion: {
        promoted: true,
      },
      ...(wishlist && {
        id: {
          in: JSON.parse(wishlist),
        },
      }),
      ...(genre && { genre }),
      ...(gender && { gender }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(language && { language }),
    },
    include: { ...includeAuthor, ...includeComments, ...includePromotion },
    take: POSTS_PER_PAGE,
    skip: offset,
  });
}

async function fetchNonPromotedPosts(
  genre: string | null,
  gender: string | null,
  wishlist: string | null,
  search: string | null,
  isAdminRequest: boolean,
  authorId: string | null,
  language: string | null,
  offset: number,
  limit: number
): Promise<any[]> {
  // Construct the include objects
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

  // Construct the where clause based on the provided filters
  const whereClause: any = {
    ...(wishlist && {
      id: {
        in: JSON.parse(wishlist),
      },
    }),
    ...(genre && { genre }),
    ...(gender && { gender }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(language && { language }),
  };

  // Fetch non-promoted posts
  return await prisma.post.findMany({
    where: whereClause,
    take: limit,
    skip: offset, // Apply the provided offset
    include: { ...includeAuthor, ...includeComments },
  });
}

function extractParams(request: Request): {
  genre: string | null;
  gender: string | null;
  wishlist: string | null;
  postsPagination: string | null;
  search: string | null;
  isAdminRequest: boolean;
  authorId: string | null;
  language: string | null;
} {
  const queryParams = new URLSearchParams(request.url.split('?')[1] || '');
  const genre = queryParams.get('genre');
  const gender = queryParams.get('gender');
  const wishlist = queryParams.get('wishlist');
  const postsPagination = queryParams.get('postsPagination');
  const search = queryParams.get('search');
  const isAdminRequest = request.headers.get('x-admin-request') === 'true';
  const authorId = queryParams.get('authorId');
  const language = request.url.split('/')[3]; // Assuming language is the first part of the path

  return {
    genre,
    gender,
    wishlist,
    postsPagination,
    search,
    isAdminRequest,
    authorId,
    language,
  };
}

async function isDuplicatePost(data: RequestBody): Promise<boolean> {
  const similarPost: any = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM "Post"
      WHERE content % ${data.content}
    ) AS "exists"
  `;
  return similarPost && similarPost[0].exists;
}

// Function to check if the user has reached the post limit for the day
async function hasReachedPostLimit(authorId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Set to the beginning of the next day

  const userPostCount = await prisma.post.count({
    where: {
      authorId: authorId,
      createdAt: {
        gte: today.toISOString(), // Posts created from the beginning of today
        lt: tomorrow.toISOString(), // Posts created before the beginning of tomorrow
      },
    },
  });

  return userPostCount >= POSTS_PER_DAY;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    // Check for duplicate post
    const isDuplicate = await isDuplicatePost(body);
    if (isDuplicate) {
      return new NextResponse('Lyrics already exist', { status: 409 });
    }

    // Check if the user has reached the post limit for the day
    const hasReachedLimit = await hasReachedPostLimit(body.authorId);
    if (hasReachedLimit) {
      return new NextResponse('Post limit exceeded for today', { status: 403 });
    }

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
