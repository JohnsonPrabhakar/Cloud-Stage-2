
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EVENT_CATEGORIES } from '@/lib/events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Shield, User, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const allInterests = EVENT_CATEGORIES;

export default function ProfilePageClient() {
    const { user } = useAuth();
    const [interests, setInterests] = useState<string[]>(['Music', 'Devotional']);

    const toggleInterest = (interest: string) => {
        setInterests(prev => 
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const getRoleIcon = () => {
        switch(user?.role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
            case 'artist': return <Star className="h-4 w-4 text-yellow-500" />;
            default: return <User className="h-4 w-4 text-blue-500" />;
        }
    }

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 text-4xl">
                            <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <CardTitle className="text-3xl font-headline">{user?.name}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline" className="capitalize">
                                    {getRoleIcon()}
                                    <span className="ml-1">{user?.role}</span>
                                </Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4"/>
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-4">My Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {allInterests.map(interest => (
                                <Button
                                    key={interest}
                                    variant={interests.includes(interest) ? "default" : "outline"}
                                    onClick={() => toggleInterest(interest)}
                                >
                                    {interest}
                                </Button>
                            ))}
                        </div>
                         <p className="text-xs text-muted-foreground mt-4">Select your interests to get personalized event recommendations.</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
