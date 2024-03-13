import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Perform authorization check here if needed
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const expiredPromotions = await prisma.promotion.findMany({
      where: {
        expires_at: {
          lt: new Date(), // Find promotions where the expiration date is less than the current date
        },
        promoted: true, // Only consider promotions that are currently active
      },
    });

    // Update each expired promotion
    await Promise.all(
      expiredPromotions.map(async (promotion) => {
        await prisma.promotion.update({
          where: {
            id: promotion.id, // Assuming each promotion has a unique ID
          },
          data: {
            promoted: false, // Set promoted to false for expired promotions
          },
        });
      })
    );

    return new Response('Expired promotions updated successfully.', {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating expired promotions:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}
