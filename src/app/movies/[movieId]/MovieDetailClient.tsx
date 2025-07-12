
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getYoutubeVideoId } from '@/lib/utils';
import type { Movie } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function MovieDetailClient({ movie }: { movie: Movie | undefined }) {
  const router = useRouter();

  if (!movie) {
    return (
        <div className="container py-12 text-center">
            <h1 className="text-2xl font-bold">Movie not found</h1>
             <p className="text-muted-foreground">The movie you are looking for does not exist.</p>
            <Button onClick={() => router.push('/movies')} className="mt-4">Back to Movies</Button>
        </div>
    );
  }

  const videoId = getYoutubeVideoId(movie.videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;

  return (
    <main className="container py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
        </Button>
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
             {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-t-lg"
                  ></iframe>
                </div>
              ) : (
                 <div className="aspect-video bg-black flex items-center justify-center text-white">
                    <p>This video is not a valid YouTube link and cannot be played.</p>
                 </div>
              )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-3xl md:text-4xl font-headline">{movie.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{movie.genre}</Badge>
                    <Badge variant="outline">{movie.language}</Badge>
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none text-foreground/80 mt-6">
              <p>{movie.description}</p>
            </div>
            
            {!embedUrl && (
              <div className="mt-8 p-4 bg-destructive/10 rounded-lg text-destructive">
                <p>Stream URL is not a valid YouTube link.</p>
                 <p className="text-sm text-muted-foreground mt-2 font-code">
                    Provided URL: <a href={movie.videoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{movie.videoUrl}</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
