

import { EVENT_CATEGORIES } from "./events";
import { MOVIE_GENRES, MOVIE_LANGUAGES } from "./movies";
import { ARTIST_CATEGORIES, ARTIST_TYPES } from "./artists";

export type EventCategory = typeof EVENT_CATEGORIES[number];

export type EventStatus = 'Upcoming' | 'Live' | 'Past' | 'Pending' | 'Approved' | 'Rejected';

export type Event = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  artist: string;
  artistEmail: string;
  artistId: string;
  date: string; // ISO String
  status: EventStatus;
  streamUrl: string;
  bannerUrl: string;
  genre: string;
  language: string;
  duration: number; // in minutes
  ticketPrice: number;
  isBoosted?: boolean;
  thumbsUp?: number;
  createdAt?: any; // Firestore timestamp
};

export type UserRole = 'artist' | 'admin' | 'user';

export type User = {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  profilePictureUrl?: string;
  subscription?: any; // Simplified for now
};

export type MovieGenre = typeof MOVIE_GENRES[number];
export type MovieLanguage = typeof MOVIE_LANGUAGES[number];

export type Movie = {
    id: string;
    title: string;
    description: string;
    language: MovieLanguage;
    genre: MovieGenre;
    videoUrl: string;
    bannerUrl: string;
    durationMinutes?: number;
    createdAt?: any; // Firestore timestamp
}

// Artist Registration Types
export type ArtistType = typeof ARTIST_TYPES[number];
export type ArtistCategory = typeof ARTIST_CATEGORIES[number];
export type ArtistStatus = 'Pending' | 'Approved' | 'Rejected';

export type Artist = {
  id: string; // Firestore document ID
  uid: string; // Firebase Auth UID
  artistType: ArtistType;
  name: string;
  category: ArtistCategory;
  profilePictureUrl: string;
  email: string;
  phone: string;
  password?: string;
  address: string;
  location: string;
  socials: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  bio: string;
  status: ArtistStatus;
  rejectionReason?: string;
  isVerified: boolean;
  followers: string[]; // array of user emails
};


// Artist Verification
export type VerificationRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type VerificationRequest = {
    id: string;
    artistId: string;
    artistName: string;
    artistEmail: string;
    artistProfilePictureUrl: string;
    status: VerificationRequestStatus;
    workUrl1: string; // YouTube
    workUrl2: string; // Instagram or Facebook
    performanceVideoUrl: string;
    reason: string;
    rejectionReason?: string;
};


export type PurchasedTicket = {
    id?: string;
    eventId: string;
    purchaseDate: string;
    userId: string;
    userEmail: string; // Can be guest email or logged-in user email
    subscriptionUsed: boolean;
};
