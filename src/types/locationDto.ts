export type LocationDTO = {
  location_id: string;
  name: string;
  description?: string | null;
  address: string;
  zip_code: number;
  city: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at?: string | null;
  user_id?: string | null;
  location_type: string;
};
