import { UserPublic } from './userPublic';

export type ReviewDTO = {
  review_id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  location_id: string;
  user?: UserPublic;
};
