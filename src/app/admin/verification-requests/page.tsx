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
import { ThumbsUp, ThumbsDown, Youtube, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import type { Artist } from '@/lib/types';


function VerificationRequestCard({ artist, onApprove, onReject }: { artist: Artist, onApprove: (id: string) => void, onReject: (id: string, reason: string) => void }) {
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
                    <div className="flex gap-4 mb-4">
                        <Avatar className="w-16 h-16 rounded-lg">
                            <AvatarImage src={artist.profilePictureUrl} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <CardTitle className="text-xl font-headline">{artist.name}</CardTitle>
                            <CardDescription>{artist.location} | {artist.category}</CardDescription>
                        </div>
                         <Badge variant={artist.verificationRequest?.status === 'Approved' ? 'default' : artist.verificationRequest?.status === 'Rejected' ? 'destructive' : 'secondary'}>
                            {artist.verificationRequest?.status}
                        </Badge>
                    </div>

                    <div className="space-y-3">
                         <div>
                            <h4 className="font-semibold text-sm">Reason for applying:</h4>
                            <p className="text-sm text-muted-foreground">{artist.verificationRequest?.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Submitted Video Links:</h4>
                            <div className="flex flex-col gap-2 mt-1">
                                <Link href={artist.verificationRequest?.videoUrl1 || '#'} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-2"><Video className="w-4 h-4"/>{artist.verificationRequest?.videoUrl1}</Link>
                                <Link href={artist.verificationRequest?.videoUrl2 || '#'} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-2"><Video className="w-4 h-4"/>{artist.verificationRequest?.videoUrl2}</Link>
                            </div>
                        </div>
                    </div>
                   
                    {artist.verificationRequest?.status === 'Pending' && (
                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1" size="sm" onClick={() => onApprove(artist.id)}><ThumbsUp className="mr-2"/>Approve</Button>
                            <Button className="flex-1" size="sm" variant="destructive" onClick={handleRejectClick}><ThumbsDown className="mr-2"/>Reject</Button>
                        </div>
                    )}
                     {artist.verificationRequest?.status === 'Rejected' && artist.verificationRequest?.rejectionReason && (
                        <div className="mt-4 p-2 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                           <strong>Rejection Reason:</strong> {artist.verificationRequest.rejectionReason}
                        </div>
                     )}
                </CardContent>
            </Card>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification for {artist.name}</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this verification request.</DialogDescription>
                    </DialogHeader>
                    <Textarea 
                        placeholder="e.g., Submitted videos do not meet community guidelines..."
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


export default function VerificationRequestsPage() {
    const { artists, updateVerificationStatus } = useArtists();
    const { toast } = useToast();

    const artistsWithRequests = artists.filter(a => !!a.verificationRequest);
    const pendingRequests = artistsWithRequests.filter(a => a.verificationRequest?.status === 'Pending');
    const approvedRequests = artistsWithRequests.filter(a => a.verificationRequest?.status === 'Approved');
    const rejectedRequests = artistsWithRequests.filter(a => a.verificationRequest?.status === 'Rejected');

    const handleApprove = (artistId: string) => {
        updateVerificationStatus(artistId, 'Approved');
        toast({ title: 'Artist Verified!' });
    };

    const handleReject = (artistId: string, reason: string) => {
        updateVerificationStatus(artistId, 'Rejected', reason);
        toast({ title: 'Verification Rejected', variant: 'destructive' });
    };

    const renderRequestList = (list: Artist[]) => {
        if (list.length === 0) {
            return <p className="col-span-full text-center text-muted-foreground mt-8">No requests in this category.</p>;
        }
        return list.map(artist => (
            <VerificationRequestCard key={artist.id} artist={artist} onApprove={handleApprove} onReject={handleReject} />
        ));
    };

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">Artist Verification Requests</h1>
             <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(pendingRequests)}
                    </div>
                </TabsContent>

                <TabsContent value="approved" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(approvedRequests)}
                    </div>
                </TabsContent>

                 <TabsContent value="rejected" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(rejectedRequests)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
