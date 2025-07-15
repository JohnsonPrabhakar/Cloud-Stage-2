
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
    thumbsUp: Math.floor(Math.random() * 1000),
  };
};

const now = new Date();

export const dummyEvents: Event[] = [
  generateEvent('live-1', 'Arijit Singh - Live Concert', 'Arijit Singh', 'Music', new Date(now.getTime()), 'Live', 'https://www.youtube.com/watch?v=s5wvoA4jG2s'),
  generateEvent('live-2', 'Zakir Khan - Haq Se Single', 'Zakir Khan', 'Stand-up Comedy', new Date(now.getTime()), 'Live', 'https://www.youtube.com/watch?v=LqC01G6n2c4'),
  
  generateEvent('upcoming-1', 'Sunidhi Chauhan - Rockstars', 'Sunidhi Chauhan', 'Music', new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=YxWlaY4cwJc'),
  generateEvent('upcoming-2', 'Gaurav Kapoor - Live Standup', 'Gaurav Kapoor', 'Stand-up Comedy', new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=1IWzY61b6hI'),
  generateEvent('upcoming-3', 'Yoga for Beginners', 'Yoga Guru', 'Meditation/Yoga', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=sTANio_2E0Q'),
  generateEvent('upcoming-4', 'Jaya Kishori - Devotional Talk', 'Jaya Kishori', 'Devotional', new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=u5j4_n44B_w'),
  
  generateEvent('past-1', 'Shreya Ghoshal - Melodious Night', 'Shreya Ghoshal', 'Music', new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=BqP0T3i366s'),
  generateEvent('past-2', 'Anubhav Singh Bassi - Bas Kar Bassi', 'Anubhav Singh Bassi', 'Stand-up Comedy', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=tS4QY_gT2gY'),
  generateEvent('past-3', 'Tech Talk: Future of AI', 'Tech Expert', 'Talk', new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=6P2nPI6CTlc'),

  generateEvent('pending-1', 'Illusionist Show', 'Magic Master', 'Magic Show', new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Pending'),
  generateEvent('rejected-1', 'My First Event', 'New Artist', 'Music', new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Rejected'),
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
