
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMovies } from '@/hooks/useMovies';
import { getYoutubeVideoId } from '@/lib/utils';
import type { Movie } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, PowerOff } from 'lucide-react';
import { useAppStatus } from '@/hooks/useAppStatus';
import Header from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function MovieDetailClient({ movieId }: { movieId: string }) {
  const { movies } = useMovies();
  const [movie, setMovie] = useState<Movie | null | undefined>(undefined);
  const router = useRouter();
  const { isOnline } = useAppStatus();

  useEffect(() => {
    if (movies.length > 0) {
      const foundMovie = movies.find(m => m.id === movieId);
      setMovie(foundMovie || null); // Set to null if not found
    }
  }, [movies, movieId]);

  if (movie === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading movie...</p>
      </div>
    );
  }

  if (movie === null) {
    return (
        <>
            <Header />
            <main className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Movie Not Found</h1>
                <p className="text-muted-foreground">The movie you are looking for does not exist or has been moved.</p>
                <Button onClick={() => router.push('/movies')} className="mt-4">Back to Movies</Button>
            </main>
      </>
    );
  }

  const youtubeVideoId = getYoutubeVideoId(movie.videoUrl);
  const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1` : null;

  return (
    <>
      <Header />
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Button>
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
                {embedUrl && isOnline ? (
                    <div className="aspect-video bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <div className="w-full aspect-video relative bg-muted">
                        <Image
                            src={movie.bannerUrl}
                            alt={movie.title}
                            layout="fill"
                            className="object-cover"
                            data-ai-hint="movie hero"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                             {isOnline ? (
                                <Button size="lg" onClick={() => window.location.reload()}>
                                    <Play className="mr-2"/> Reload to Watch
                                </Button>
                            ) : (
                                <div className="text-center text-white p-4 bg-black/50 rounded-lg">
                                    <PowerOff className="mx-auto h-12 w-12 mb-2" />
                                    <h2 className="text-xl font-bold font-headline">App is Currently Offline</h2>
                                    <p className="text-sm text-foreground/80">Video playback is disabled.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="text-3xl md:text-4xl font-headline">{movie.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground my-4">
                <Badge variant="secondary">{movie.genre}</Badge>
                <Badge variant="outline">{movie.language}</Badge>
              </div>
              <Separator className="my-6" />
              <div className="prose max-w-none text-foreground/80">
                <p>{movie.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
