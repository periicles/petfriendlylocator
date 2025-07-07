export type TCreateLocationInput = {
  name: string;
  description?: string;
  address: string;
  zip_code: number;
  city: string;
  latitude: string;
  longitude: string;
  location_type: 'PARK' | 'BEACH' | 'RESTAURANT' | 'SHOP' | 'OTHER';
};
