import type { Event, EventCategory } from './types';
import { getYoutubeVideoId } from './utils';

export const EVENT_CATEGORIES = [
  "Music",
  "Stand-up Comedy",
  "Workshop",
  "Talk",
  "Meditation/Yoga",
  "Magic Show",
  "Devotional",
] as const;


const generateEvent = (
  id: string,
  title: string,
  artist: string,
  category: EventCategory,
  date: Date,
  status: 'Upcoming' | 'Live' | 'Past',
  streamUrl: string,
  adminStatus: 'Pending' | 'Approved' | 'Rejected' = 'Approved'
): Event => {
  const videoId = getYoutubeVideoId(streamUrl);
  return {
    id,
    title,
    description: `Join us for an amazing ${category} event: "${title}" by ${artist}. Get ready for an unforgettable experience filled with incredible moments and great vibes.`,
    artist,
    artistEmail: status === 'Live' ? 'artist@cloudstage.live' : `${artist.toLowerCase().replace(' ', '')}@example.com`,
    category,
    date: date.toISOString(),
    status: adminStatus === 'Approved' ? status : adminStatus,
    streamUrl,
    bannerUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    genre: 'Various',
    language: 'English',
    duration: 90,
    ticketPrice: Math.random() > 0.5 ? 10 : 0,
    isBoosted: Math.random() > 0.7,
  };
};

const now = new Date();

export const dummyEvents: Event[] = [
  // All mock data removed as per user request
];
