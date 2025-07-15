
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/context/UserContext';
import { EVENT_CATEGORIES } from '@/lib/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Shield, User, Star, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const allInterests = EVENT_CATEGORIES;

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  profilePictureUrl: z.string().url("Please provide a valid image URL or upload a file."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function EditProfileDialog({ user, onOpenChange, isOpen }: { user: any; onOpenChange: (open: boolean) => void; isOpen: boolean; }) {
    const { updateUser } = useUsers();
    const { toast } = useToast();
    const { setUser } = useAuth(); // Assuming AuthContext provides a way to update the user state
    const [preview, setPreview] = useState(user.profilePictureUrl || '');

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user.name || '',
            profilePictureUrl: user.profilePictureUrl || '',
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                form.setValue('profilePictureUrl', result, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: ProfileFormValues) => {
        const updatedUser = {
            ...user,
            ...data,
        };
        updateUser(updatedUser);
        setUser(updatedUser); // Update the user in the auth context
        toast({ title: "Profile updated successfully!" });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your name and profile picture.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <div className="flex flex-col items-center gap-4">
                            <Avatar className="w-24 h-24 text-4xl">
                                <AvatarImage src={preview} />
                                <AvatarFallback><Upload /></AvatarFallback>
                            </Avatar>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs"/>
                            </FormControl>
                             <FormMessage>{form.formState.errors.profilePictureUrl?.message}</FormMessage>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function ProfilePageClient() {
    const { user } = useAuth();
    const [interests, setInterests] = useState<string[]>(['Music', 'Devotional']);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

    if (!user) {
        return null; // or a loading state
    }

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 text-4xl">
                            <AvatarImage src={user.profilePictureUrl} />
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
                        <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
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
            <EditProfileDialog user={user} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
        </main>
    );
}
