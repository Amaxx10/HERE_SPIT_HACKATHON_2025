import { create } from 'zustand';
import { Review, Location } from '@/types/review';

interface ReviewStore {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'timestamp'>) => void;
  getReviewsByLocation: (location: Location, radiusInKm?: number) => Review[];
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  
  addReview: (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    
    set((state) => ({
      reviews: [...state.reviews, newReview],
    }));
  },

  getReviewsByLocation: (location, radiusInKm = 0.1) => {
    const { reviews } = get();
    return reviews.filter((review) => {
      const distance = calculateDistance(location, review.location);
      return distance <= radiusInKm;
    });
  },
}));

function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const lat1 = toRad(loc1.latitude);
  const lat2 = toRad(loc2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}
