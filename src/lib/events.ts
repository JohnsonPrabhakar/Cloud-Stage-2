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
  generateEvent(
    '1', 'Acoustic Serenity', 'Elena Vance', 'Music', 
    new Date(now.getTime()), 'Live', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  ),
  generateEvent(
    '2', 'Cosmic Chuckles', 'Giggles McGee', 'Stand-up Comedy', 
    new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=R9z26B_K-gY'
  ),
  generateEvent(
    '3', 'Watercolor Wonders', 'Artful Anya', 'Workshop', 
    new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=3Gq-3lqA-h8'
  ),
  generateEvent(
    '4', 'The Future of AI', 'Dr. Alex Reed', 'Talk', 
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=s_pp32iC4uI'
  ),
  generateEvent(
    '5', 'Morning Flow Yoga', 'Zen Zephyr', 'Meditation/Yoga', 
    new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=YpGj_SgQk_U'
  ),
  generateEvent(
    '6', 'Illusions of Grandeur', 'Magnifico Max', 'Magic Show', 
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), 'Past', 'https://www.youtube.com/watch?v=U3oIq4a6s-A'
  ),
  generateEvent(
    '7', 'Sacred Chants', 'Seraphina', 'Devotional', 
    new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=c7l1S9_45gA'
  ),
  generateEvent(
    '8', 'Rock the Night Away', 'The Crimson Tide', 'Music', 
    new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=l482T0yNkeo'
  ),
    generateEvent(
    '9', 'Tech Talk: Web3', 'Dev Guru', 'Talk',
    new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=YQ_xWvX1n9g', 'Pending'
  ),
  generateEvent(
    '10', 'Laugh Riot', 'Comedy Crew', 'Stand-up Comedy',
    new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), 'Upcoming', 'https://www.youtube.com/watch?v=a1-p22-m6g4', 'Rejected'
  ),
];
