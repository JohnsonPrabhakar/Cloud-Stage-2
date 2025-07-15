
export interface Subscription {
  planType: 'premium';
  startDate: string;
  expiryDate: string;
  eventCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Should be hashed in a real app
  profilePictureUrl?: string;
  subscription?: Subscription | null;
}

export const dummyUsers: User[] = [];
