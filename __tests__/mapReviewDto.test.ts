import { describe, it, expect } from '@jest/globals';
import { mapReviewToDTO, mapReviewsToDTO } from '@/utils/mapReviewDto';

const baseReview = {
  review_id: 'rev_1',
  rating: 4,
  title: 'Super endroit',
  content: 'Accueil chaleureux pour les chiens.',
  created_at: new Date('2024-05-01T10:00:00.000Z'),
  user_id: 'user_1',
  location_id: 'loc_1',
};

describe('mapReviewToDTO', () => {
  it('exposes the author pseudo and serialises the date', () => {
    const dto = mapReviewToDTO({ ...baseReview, user: { pseudo: 'Alice' } });

    expect(dto).toEqual({
      review_id: 'rev_1',
      rating: 4,
      title: 'Super endroit',
      content: 'Accueil chaleureux pour les chiens.',
      created_at: '2024-05-01T10:00:00.000Z',
      author: 'Alice',
      location_id: 'loc_1',
    });
  });

  it('falls back to null author when the user relation is missing', () => {
    const dto = mapReviewToDTO({ ...baseReview, user: null });
    expect(dto.author).toBeNull();
  });

  it('never leaks the user_id', () => {
    const dto = mapReviewToDTO({ ...baseReview, user: { pseudo: 'Alice' } });
    expect(dto).not.toHaveProperty('user_id');
  });

  it('maps a list', () => {
    expect(mapReviewsToDTO([{ ...baseReview, user: { pseudo: 'Bob' } }])).toHaveLength(1);
  });
});
