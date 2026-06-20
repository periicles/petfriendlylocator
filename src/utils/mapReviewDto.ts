import { Prisma } from '@prisma/client';
import { ReviewDTO } from '@/types/reviewDto';

/** A Prisma `Review` joined with its author's public pseudo. */
export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: { user: { select: { pseudo: true } } };
}>;

/**
 * Convert a Prisma `Review` row into the public `ReviewDTO`.
 *
 * Exposes only the author's `pseudo` (never email/id), serialises `created_at`
 * to an ISO string, and keeps the API contract decoupled from the DB schema.
 */
export function mapReviewToDTO(review: ReviewWithAuthor): ReviewDTO {
  return {
    review_id: review.review_id,
    rating: review.rating,
    title: review.title,
    content: review.content,
    created_at: review.created_at.toISOString(),
    author: review.user?.pseudo ?? null,
    location_id: review.location_id,
  };
}

export function mapReviewsToDTO(reviews: ReviewWithAuthor[]): ReviewDTO[] {
  return reviews.map(mapReviewToDTO);
}
