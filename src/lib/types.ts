import { EVENT_CATEGORIES } from "./events";

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
