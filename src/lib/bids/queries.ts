/**
 * Bid data fetching functions
 * Server-side only queries for bid data with tender relations
 */

import 'server-only'
import { prisma } from '@/lib/prisma'

/**
 * Get bid by tender and user
 * Returns bid with tender relation or null
 */
export async function getBidByTenderAndUser(
  tenderId: string,
  userId: string
) {
  const bid = await prisma.bid.findFirst({
    where: {
      tenderId,
      company: {
        ownerId: userId,
      },
    },
    include: {
      tender: true,
    },
  })

  return bid
}

/**
 * Get all bids for user's company
 * Returns array of bids with tender, ordered by updatedAt desc
 */
export async function getBidsByUser(userId: string) {
  const bids = await prisma.bid.findMany({
    where: {
      company: {
        ownerId: userId,
      },
    },
    include: {
      tender: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return bids
}
