
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useArtists } from '@/hooks/useArtists';
import { ARTIST_TYPES, ARTIST_CATEGORIES, DUMMY_LOCATIONS } from '@/lib/artists';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const artistFormSchema = z.object({
  artistType: z.enum(ARTIST_TYPES, { required_error: 'Artist type is required.' }),
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.enum(ARTIST_CATEGORIES, { required_error: 'Category is required.' }),
  profilePictureUrl: z.string().url("Please upload a profile picture."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address is required."),
  location: z.string({ required_error: 'Location is required.' }),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  bio: z.string().min(20, "Bio must be at least 20 characters.").max(500, "Bio cannot exceed 500 characters."),
}).refine(data => !!data.instagram || !!data.youtube || !!data.facebook, {
    message: "At least one social media link is required.",
    path: ["instagram"],
});

type ArtistFormValues = z.infer<typeof artistFormSchema>;

export default function EditProfilePageClient() {
  const router = useRouter();
  const { artists, updateArtist } = useArtists();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const currentArtist = artists.find(a => a.email === user?.email);

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      instagram: '',
      youtube: '',
      facebook: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (currentArtist) {
        form.reset({
            artistType: currentArtist.artistType,
            name: currentArtist.name,
            category: currentArtist.category,
            profilePictureUrl: currentArtist.profilePictureUrl,
            phone: currentArtist.phone,
            address: currentArtist.address,
            location: currentArtist.location,
            instagram: currentArtist.socials.instagram || '',
            youtube: currentArtist.socials.youtube || '',
            facebook: currentArtist.socials.facebook || '',
            bio: currentArtist.bio,
        });
        setProfilePreview(currentArtist.profilePictureUrl);
    }
  }, [currentArtist, form]);


  function handleProfilePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePreview(result);
        form.setValue('profilePictureUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }

  function onSubmit(data: ArtistFormValues) {
    if (!currentArtist) {
        toast({ variant: "destructive", title: "Error", description: "Could not find artist profile to update."});
        return;
    }

    const updatedArtist = {
        ...currentArtist,
        artistType: data.artistType,
        name: data.name,
        category: data.category,
        profilePictureUrl: data.profilePictureUrl,
        phone: data.phone,
        address: data.address,
        location: data.location,
        socials: {
            instagram: data.instagram,
            youtube: data.youtube,
            facebook: data.facebook,
        },
        bio: data.bio
    };

    updateArtist(updatedArtist);

    toast({
      title: "Profile Updated!",
      description: "Your profile details have been successfully saved.",
    });
    router.push('/artist/dashboard');
  }

  if (!currentArtist) {
      return (
          <div className="flex items-center justify-center min-h-[60vh]">
              <p>Loading artist profile...</p>
          </div>
      )
  }

  return (
    <div className="container py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Edit Your Profile</CardTitle>
          <CardDescription>Keep your artist profile up-to-date for your fans.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 space-y-2">
                    <FormLabel>Profile Picture</FormLabel>
                    <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                       {profilePreview ? (
                           <Image src={profilePreview} alt="Profile Preview" width={200} height={200} className="object-cover w-full h-full" />
                       ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto h-12 w-12"/>
                            <p className="text-sm mt-2">Upload a picture</p>
                        </div>
                       )}
                    </div>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="text-xs"/>
                    </FormControl>
                    <FormMessage>{form.formState.errors.profilePictureUrl?.message}</FormMessage>
                </div>
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="artistType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Artist Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                                <SelectContent>{ARTIST_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger></FormControl>
                                <SelectContent>{ARTIST_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Artist/Band Name</FormLabel>
                            <FormControl><Input placeholder="e.g., The Starlights" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </div>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your city..." /></SelectTrigger></FormControl>
                        <SelectContent>{DUMMY_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>


              <div>
                <FormLabel>Social Media (at least one is required)</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    <FormField control={form.control} name="instagram" render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Instagram URL" {...field} /></FormControl></FormItem>
                    )}/>
                     <FormField control={form.control} name="youtube" render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="YouTube URL" {...field} /></FormControl></FormItem>
                    )}/>
                     <FormField control={form.control} name="facebook" render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Facebook URL" {...field} /></FormControl></FormItem>
                    )}/>
                </div>
                 <FormMessage>{form.formState.errors.instagram?.message}</FormMessage>
              </div>

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                    <FormLabel>Short Bio / Description</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="Tell us about your art..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
              )}/>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/artist/dashboard')}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
