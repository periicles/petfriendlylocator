import { LocationDTO } from './locationDto';
import { ReviewDTO } from './reviewDto';

export type LocationWithReviews = LocationDTO & {
  reviews: ReviewDTO[];
};
