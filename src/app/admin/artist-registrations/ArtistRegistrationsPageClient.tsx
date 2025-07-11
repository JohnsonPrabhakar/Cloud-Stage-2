
'use client';

import { useState } from 'react';
import { useArtists } from '@/hooks/useArtists';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Youtube, Facebook, Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import type { Artist } from '@/lib/types';


function ArtistCard({ artist, onApprove, onReject }: { artist: Artist, onApprove: (id: string) => void, onReject: (id: string, reason: string) => void }) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectClick = () => {
        setShowRejectDialog(true);
    };

    const handleConfirmReject = () => {
        if(rejectionReason.trim()){
            onReject(artist.id, rejectionReason);
            setShowRejectDialog(false);
        }
    };
    
    return (
        <>
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <Avatar className="w-24 h-24 rounded-lg">
                            <AvatarImage src={artist.profilePictureUrl} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-headline">{artist.name}</CardTitle>
                                    <CardDescription>{artist.location} | {artist.category}</CardDescription>
                                </div>
                                <Badge variant={artist.status === 'Approved' ? 'default' : artist.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                    {artist.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>
                            <div className="flex items-center gap-3">
                                {artist.socials.instagram && <Link href={artist.socials.instagram} target="_blank"><Instagram className="w-5 h-5 hover:text-primary"/></Link>}
                                {artist.socials.youtube && <Link href={artist.socials.youtube} target="_blank"><Youtube className="w-5 h-5 hover:text-primary"/></Link>}
                                {artist.socials.facebook && <Link href={artist.socials.facebook} target="_blank"><Facebook className="w-5 h-5 hover:text-primary"/></Link>}
                            </div>
                        </div>
                    </div>
                    {artist.status === 'Pending' && (
                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1" size="sm" onClick={() => onApprove(artist.id)}><ThumbsUp className="mr-2"/>Approve</Button>
                            <Button className="flex-1" size="sm" variant="destructive" onClick={handleRejectClick}><ThumbsDown className="mr-2"/>Reject</Button>
                        </div>
                    )}
                     {artist.status === 'Rejected' && artist.rejectionReason && (
                        <div className="mt-4 p-2 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                           <strong>Reason:</strong> {artist.rejectionReason}
                        </div>
                     )}
                </CardContent>
            </Card>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Artist: {artist.name}</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this artist application. This will be recorded.</DialogDescription>
                    </DialogHeader>
                    <Textarea 
                        placeholder="e.g., Social media profiles do not match..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


export default function ArtistRegistrationsPageClient() {
    const { artists, updateArtistStatus } = useArtists();
    const { toast } = useToast();

    const pendingArtists = artists.filter(a => a.status === 'Pending');
    const approvedArtists = artists.filter(a => a.status === 'Approved');
    const rejectedArtists = artists.filter(a => a.status === 'Rejected');

    const handleApprove = (artistId: string) => {
        updateArtistStatus(artistId, 'Approved');
        toast({ title: 'Artist Approved!' });
    };

    const handleReject = (artistId: string, reason: string) => {
        updateArtistStatus(artistId, 'Rejected', reason);
        toast({ title: 'Artist Rejected', variant: 'destructive' });
    };

    const renderArtistList = (list: Artist[]) => {
        if (list.length === 0) {
            return <p className="col-span-full text-center text-muted-foreground mt-8">No artists in this category.</p>;
        }
        return list.map(artist => (
            <ArtistCard key={artist.id} artist={artist} onApprove={handleApprove} onReject={handleReject} />
        ));
    };

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">Artist Registrations</h1>
             <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending ({pendingArtists.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedArtists.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedArtists.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderArtistList(pendingArtists)}
                    </div>
                </TabsContent>

                <TabsContent value="approved" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderArtistList(approvedArtists)}
                    </div>
                </TabsContent>

                 <TabsContent value="rejected" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderArtistList(rejectedArtists)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
