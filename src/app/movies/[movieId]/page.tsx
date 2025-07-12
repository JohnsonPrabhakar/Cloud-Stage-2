
'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MovieDetailClient from './MovieDetailClient';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.movieId as string;

  return (
    <>
      <Header />
      <MovieDetailClient movieId={movieId} />
    </>
  );
}
