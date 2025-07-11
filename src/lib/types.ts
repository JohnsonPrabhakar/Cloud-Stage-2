
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
  date: string;
  status: EventStatus;
  streamUrl: string;
  bannerUrl: string;
  genre: string;
  language: string;
  duration: number; // in minutes
  ticketPrice: number; // in USD
  isBoosted?: boolean;
};

export type UserRole = 'artist' | 'admin';

export type User = {
  email: string;
  role: UserRole;
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
}

// Artist Registration Types
export type ArtistType = typeof ARTIST_TYPES[number];
export type ArtistCategory = typeof ARTIST_CATEGORIES[number];
export type ArtistStatus = 'Pending' | 'Approved' | 'Rejected';

export type Artist = {
  id: string;
  artistType: ArtistType;
  name: string;
  category: ArtistCategory;
  profilePictureUrl: string;
  email: string;
  phone: string;
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

// Guest checkout and ticketing
export type GuestDetails = {
    name: string;
    email: string;
    phone: string;
};

export type PurchasedTicket = {
    eventId: string;
    purchaseDate: string;
    userEmail: string; // Can be guest email or logged-in user email
    guestDetails?: GuestDetails;
};
