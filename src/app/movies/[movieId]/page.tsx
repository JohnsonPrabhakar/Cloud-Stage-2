
import MovieDetailClient from './MovieDetailClient';

export default function MovieDetailPage({ params }: { params: { movieId: string } }) {
  const { movieId } = params;

  return <MovieDetailClient movieId={movieId} />;
}
