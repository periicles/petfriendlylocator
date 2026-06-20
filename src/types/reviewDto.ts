export type ReviewDTO = {
  review_id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  author: string | null;
  location_id: string;
};
