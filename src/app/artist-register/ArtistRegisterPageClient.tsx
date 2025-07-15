
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useArtists } from '@/hooks/useArtists';
import { ARTIST_TYPES, ARTIST_CATEGORIES } from '@/lib/artists';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Header from '@/components/layout/Header';

const artistFormSchema = z.object({
  artistType: z.enum(ARTIST_TYPES, { required_error: 'Artist type is required.' }),
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.enum(ARTIST_CATEGORIES, { required_error: 'Category is required.' }),
  profilePictureUrl: z.string().url("Please upload a profile picture."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address is required."),
  location: z.string().min(2, "Location is required."),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  bio: z.string().min(20, "Bio must be at least 20 characters.").max(500, "Bio cannot exceed 500 characters."),
}).refine(data => !!data.instagram || !!data.youtube || !!data.facebook, {
    message: "At least one social media link is required.",
    path: ["instagram"],
});

type ArtistFormValues = z.infer<typeof artistFormSchema>;

export default function ArtistRegisterPageClient() {
  const router = useRouter();
  const { addArtist } = useArtists();
  const { toast } = useToast();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      location: '',
      instagram: '',
      youtube: '',
      facebook: '',
      bio: '',
    },
  });

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

  async function onSubmit(data: ArtistFormValues) {
    try {
      await addArtist(data);
      toast({
        title: "Registration Submitted!",
        description: "Your application is under review. We'll notify you soon.",
      });
      router.push('/login'); // Redirect to login page for artists
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Registration Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  }

  return (
    <>
    <Header/>
    <div className="container py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Artist Registration</CardTitle>
          <CardDescription>Tell us about yourself. All applications are subject to review.</CardDescription>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                                <SelectContent>{ARTIST_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
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
                        <FormControl><Input placeholder="e.g., New York, USA" {...field} /></FormControl>
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
                <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
