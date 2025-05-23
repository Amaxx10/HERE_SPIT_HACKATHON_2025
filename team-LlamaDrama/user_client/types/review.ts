export interface Location {
  latitude: number;
  longitude: number;
}

export interface Review {
  id: string;
  location: Location;
  rating: number;
  text: string;
  timestamp: number;
}

export interface ReviewFormData {
  rating: number;
  text: string;
}
