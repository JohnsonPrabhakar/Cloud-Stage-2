
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Download, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DevotionalStatusPageClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [imageSeed, setImageSeed] = useState(1);
    const { toast } = useToast();

    const handleGenerate = () => {
        setIsLoading(true);
        setTimeout(() => {
            setImageSeed(Math.random());
            setIsLoading(false);
            toast({ title: "New Image Generated!", description: "A new devotional image is ready." });
        }, 1000); // Simulate AI generation time
    };

    const handleShare = () => {
        // This is a placeholder action. In a real app, it would use the Web Share API.
        toast({ title: "Sharing not implemented", description: "This is a UI placeholder." });
    };

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6 flex flex-col items-center">
            <div className="w-full max-w-sm mx-auto">
                <div className="space-y-4 text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">Devotional Status</h1>
                    <p className="text-muted-foreground">
                        Generate and share your spiritual thought of the day.
                    </p>
                </div>
                
                <Card className="overflow-hidden shadow-2xl">
                    <CardContent className="p-0">
                        <div className="aspect-square w-full relative">
                            <Image
                                key={imageSeed} // Force re-render on new seed
                                src={`https://placehold.co/600x600/800020/F5F5DC?text=ॐ`}
                                alt="Devotional Image"
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint="spiritual symbol"
                            />
                             {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="h-12 w-12 text-white animate-spin"/>
                                </div>
                            )}
                        </div>
                         <div className="p-6 bg-card text-center">
                            <p className="text-lg font-medium">ॐ नमः शिवाय</p>
                            <p className="text-sm text-muted-foreground">Your spiritual thought of the day.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 p-6 bg-muted/30">
                        <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
                            Generate New Image
                        </Button>
                         <Button className="w-full" variant="secondary" onClick={handleShare}>
                            <Share2 className="mr-2"/>
                            Share as WhatsApp Status
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
