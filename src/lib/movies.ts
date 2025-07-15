
import type { Movie } from './types';
import { getYoutubeVideoId } from './utils';

export const MOVIE_GENRES = [
  "Action",
  "Comedy",
  "Romance",
  "Thriller",
  "Sci-Fi",
  "Drama",
  "Horror",
  "Documentary",
] as const;

export const MOVIE_LANGUAGES = [
    "English",
    "Hindi",
    "Tamil",
    "Spanish",
    "French",
] as const;

export const dummyMovies: Movie[] = [
    {
        "id": "m1",
        "title": "Cyber City Chronicles",
        "description": "In a neon-drenched metropolis, a rogue detective uncovers a conspiracy that threatens to unravel the fabric of society.",
        "language": "English",
        "genre": "Sci-Fi",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "bannerUrl": "https://placehold.co/600x900/1a1a2e/ffffff?text=Cyber",
        "durationMinutes": 148
    },
    {
        "id": "m2",
        "title": "The Last Laugh",
        "description": "A down-on-his-luck comedian gets one last shot at fame, but his comeback is hilariously derailed by a series of bizarre events.",
        "language": "English",
        "genre": "Comedy",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "bannerUrl": "https://placehold.co/600x900/f0a500/000000?text=Laugh",
        "durationMinutes": 95
    },
    {
        "id": "m3",
        "title": "Dil Ki Dhadkan",
        "description": "Two star-crossed lovers from different worlds fight for their love against family opposition and societal norms in bustling Mumbai.",
        "language": "Hindi",
        "genre": "Romance",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "bannerUrl": "https://placehold.co/600x900/e43f5a/ffffff?text=Dil",
        "durationMinutes": 162
    },
    {
        "id": "m4",
        "title": "Shadow Protocol",
        "description": "A disgraced spy is reactivated to stop a ghost from her past who is threatening global security with a deadly new weapon.",
        "language": "English",
        "genre": "Action",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "bannerUrl": "https://placehold.co/600x900/34495e/ecf0f1?text=Shadow",
        "durationMinutes": 125
    },
    {
        "id": "m5",
        "title": "The Forgotten Kingdom",
        "description": "An archaeologist discovers a map leading to a legendary lost city, but she's not the only one after its secrets.",
        "language": "English",
        "genre": "Action",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "bannerUrl": "https://placehold.co/600x900/8e7d6f/ffffff?text=Kingdom",
        "durationMinutes": 133
    }
];

// Initialize local storage with dummy data if it's empty
if (typeof window !== 'undefined' && !localStorage.getItem('movies')) {
    localStorage.setItem('movies', JSON.stringify(dummyMovies));
}
