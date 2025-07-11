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
    generateEvent('1', 'Acoustic Soul Sessions', 'Elena Vance', 'Music', new Date(now.getTime() - 2 * 60 * 60 * 1000), 'Live', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    generateEvent('2', 'Laugh Riot', 'Sammy G', 'Stand-up Comedy', new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=3-M3P3aOa_c'),
    generateEvent('3', 'Yoga for Peace', 'Anna Z', 'Meditation/Yoga', new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=V7m4g_0Kx_M'),
    generateEvent('4', 'Tech Horizons', 'Dr. Alex Ray', 'Talk', new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=vrPzs0I6-mY'),
    generateEvent('5', 'Mystic Marvels', 'The Great Fantini', 'Magic Show', new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=J3xY8-Uo1Ok'),
    generateEvent('6', 'The Art of Code', 'Dev Danny', 'Workshop', new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=k-YY0_O-t7g'),
    generateEvent('7', 'Rock the Night', 'The Scorchers', 'Music', new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=s_nc1kh-i-A'),
    generateEvent('8', 'Soulful Chants', 'Harmony Group', 'Devotional', new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=B7b4F3m3_e0', 'Pending'),
];

// Centralized function to get an event by ID
export async function getEventById(eventId: string): Promise<Event | undefined> {
  // In a real app, this would be an API call.
  // Here, we simulate fetching from either localStorage or the initial dummy data.
  if (typeof window !== 'undefined') {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      try {
        const events: Event[] = JSON.parse(storedEvents);
        return events.find(e => e.id === eventId);
      } catch (error) {
        console.error("Failed to parse events from localStorage", error);
      }
    }
  }
  // Fallback to dummyEvents if localStorage is not available or empty
  return dummyEvents.find(e => e.id === eventId);
}