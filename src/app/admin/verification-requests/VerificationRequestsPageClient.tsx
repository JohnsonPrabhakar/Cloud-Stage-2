
'use client';

import { useState } from 'react';
import { useArtists } from '@/hooks/useArtists';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Youtube, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

import type { VerificationRequest } from '@/lib/types';

function VerificationRequestCard({ request, onApprove, onReject }: { request: VerificationRequest, onApprove: (id: string) => void, onReject: (id: string, reason: string) => void }) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectClick = () => {
        setShowRejectDialog(true);
    };

    const handleConfirmReject = () => {
        if(rejectionReason.trim()){
            onReject(request.artistId, rejectionReason);
            setShowRejectDialog(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex gap-4 items-center">
                        <Avatar className="w-16 h-16 rounded-lg">
                            <AvatarImage src={request.artistProfilePictureUrl} alt={request.artistName} />
                            <AvatarFallback>{request.artistName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl font-headline">{request.artistName}</CardTitle>
                            <CardDescription>{request.artistEmail}</CardDescription>
                        </div>
                         <Badge variant={request.status === 'Approved' ? 'default' : request.status === 'Rejected' ? 'destructive' : 'secondary'} className="ml-auto">
                            {request.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Reason for Verification</h4>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Performance Video</h4>
                         {request.performanceVideoUrl ? (
                            <video controls width="100%" className="rounded-lg mt-2" key={request.performanceVideoUrl}>
                                <source src={request.performanceVideoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                         ) : <p className="text-sm text-muted-foreground">Not provided.</p>}
                    </div>
                    <div>
                        <h4 className="font-semibold">Links</h4>
                        <div className="flex gap-4 mt-2">
                             {request.workUrl1 && <Button variant="outline" size="sm" asChild>
                                <Link href={request.workUrl1} target="_blank"><Youtube className="mr-2"/>YouTube</Link>
                             </Button>}
                             {request.workUrl2 && <Button variant="outline" size="sm" asChild>
                                <Link href={request.workUrl2} target="_blank"><LinkIcon className="mr-2"/>Social</Link>
                             </Button>}
                             {!request.workUrl1 && !request.workUrl2 && <p className="text-sm text-muted-foreground">No links provided.</p>}
                        </div>
                    </div>
                    {request.status === 'Pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                            <Button className="flex-1" size="sm" onClick={() => onApprove(request.artistId)}><ThumbsUp className="mr-2"/>Approve</Button>
                            <Button className="flex-1" size="sm" variant="destructive" onClick={handleRejectClick}><ThumbsDown className="mr-2"/>Reject</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification Request: {request.artistName}</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this request.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Submitted links are broken..."
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


export default function VerificationRequestsPageClient() {
    const { verificationRequests, approveVerification, rejectVerification } = useArtists();
    const { toast } = useToast();

    const pending = verificationRequests.filter(r => r.status === 'Pending');
    const approved = verificationRequests.filter(r => r.status === 'Approved');
    const rejected = verificationRequests.filter(r => r.status === 'Rejected');

    const handleApprove = (artistId: string) => {
        approveVerification(artistId);
        toast({ title: 'Request Approved!', description: "The artist is now verified." });
    };

    const handleReject = (artistId: string, reason: string) => {
        rejectVerification(artistId, reason);
        toast({ title: 'Request Rejected', variant: 'destructive' });
    };

    const renderRequestList = (list: VerificationRequest[]) => {
        if (list.length === 0) {
            return <p className="col-span-full text-center text-muted-foreground mt-8">No requests in this category.</p>;
        }
        return list.map(req => (
            <VerificationRequestCard key={req.id} request={req} onApprove={handleApprove} onReject={handleReject} />
        ));
    };

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">Artist Verification Requests</h1>
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(pending)}
                    </div>
                </TabsContent>
                <TabsContent value="approved" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(approved)}
                    </div>
                </TabsContent>
                <TabsContent value="rejected" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderRequestList(rejected)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
