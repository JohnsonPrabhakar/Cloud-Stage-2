import { EVENT_CATEGORIES } from "./events";
import { MOVIE_GENRES, MOVIE_LANGUAGES } from "./movies";

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
