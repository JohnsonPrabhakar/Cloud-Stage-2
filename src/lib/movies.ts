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
        id: 'm1',
        title: 'Cyber Ronin',
        description: 'In a neon-drenched future, a lone warrior fights to reclaim his honor from a corrupt corporation that stole his past.',
        language: 'English',
        genre: 'Sci-Fi',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bannerUrl: `https://img.youtube.com/vi/${getYoutubeVideoId('https://www.youtube.com/watch?v=s_nc1kh-i-A')}/maxresdefault.jpg`,
    },
    {
        id: 'm2',
        title: 'The Last Joke',
        description: 'A down-on-his-luck comedian discovers a secret that could either make him a legend or get him killed.',
        language: 'English',
        genre: 'Comedy',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bannerUrl: `https://img.youtube.com/vi/${getYoutubeVideoId('https://www.youtube.com/watch?v=3-M3P3aOa_c')}/maxresdefault.jpg`,
    },
     {
        id: 'm3',
        title: 'Echoes of the Heart',
        description: 'Two estranged lovers are reunited by fate in the romantic city of Paris, but their past secrets threaten their second chance.',
        language: 'French',
        genre: 'Romance',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bannerUrl: `https://img.youtube.com/vi/${getYoutubeVideoId('https://www.youtube.com/watch?v=J3xY8-Uo1Ok')}/maxresdefault.jpg`,
    },
    {
        id: 'm4',
        title: 'Dil Ki Dhadkan',
        description: 'A heartwarming story about family, love, and the pursuit of dreams against all odds in bustling Mumbai.',
        language: 'Hindi',
        genre: 'Drama',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        bannerUrl: `https://img.youtube.com/vi/${getYoutubeVideoId('https://www.youtube.com/watch?v=B7b4F3m3_e0')}/maxresdefault.jpg`,
    }
];
