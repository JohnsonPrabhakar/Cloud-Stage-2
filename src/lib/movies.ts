
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

export const dummyMovies: Movie[] = [];
