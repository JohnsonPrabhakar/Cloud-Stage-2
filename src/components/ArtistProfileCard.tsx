
import type { Artist } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Youtube, Facebook, MapPin, Tag } from 'lucide-react';
import { Separator } from './ui/separator';

export function ArtistProfileCard({ artist }: { artist: Artist }) {
    return (
        <div className="flex flex-col items-center text-center gap-4 p-4 pt-0">
            <Avatar className="w-24 h-24 rounded-full border-2 border-primary">
                <AvatarImage src={artist.profilePictureUrl} alt={artist.name} />
                <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
                <h2 className="text-2xl font-headline font-bold sr-only">{artist.name}</h2>
                <div className="text-muted-foreground flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {artist.location}</div>
                    <div className="flex items-center gap-1"><Tag className="w-4 h-4" /> {artist.category}</div>
                </div>
            </div>

            <Separator />
            
            <p className="text-sm text-foreground/80 text-center max-h-40 overflow-y-auto">
                {artist.bio}
            </p>

            <div className="flex items-center gap-4 mt-2">
                {artist.socials.instagram && 
                    <Link href={artist.socials.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-6 h-6 hover:text-primary transition-colors"/>
                    </Link>}
                {artist.socials.youtube && 
                    <Link href={artist.socials.youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="w-6 h-6 hover:text-primary transition-colors"/>
                    </Link>}
                {artist.socials.facebook && 
                    <Link href={artist.socials.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-6 h-6 hover:text-primary transition-colors"/>
                    </Link>}
            </div>
        </div>
    );
}

    