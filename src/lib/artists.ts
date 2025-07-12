
import type { Artist, VerificationRequest } from './types';

export const ARTIST_TYPES = ["Solo Artist", "Band"] as const;

export const ARTIST_CATEGORIES = [
  "Music",
  "Comedy",
  "Talk Show",
  "Yoga",
  "Theatre",
  "Magic",
  "Others",
] as const;

export const DUMMY_LOCATIONS = [
    "New York, USA",
    "London, UK",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Mumbai, India",
    "Paris, France"
];

export const dummyArtists: Artist[] = [];

export const dummyVerificationRequests: VerificationRequest[] = [];
