import type { Artist } from './types';

export const ARTIST_TYPES = ["Solo Artist", "Band"] as const;

export const ARTIST_CATEGORIES = [
  "Music",
  "Comedy",
  "Talk Show",
  "Yoga",
  "Theatre",
  "Magic",
  "Others",
] as const;

export const DUMMY_LOCATIONS = [
    "New York, USA",
    "London, UK",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Mumbai, India",
    "Paris, France"
];

export const dummyArtists: Artist[] = [
    {
        id: 'artist1',
        artistType: 'Solo Artist',
        name: 'John Doe',
        category: 'Music',
        profilePictureUrl: 'https://placehold.co/100x100.png',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Music Lane, Nashville, TN',
        location: 'New York, USA',
        socials: {
            instagram: 'https://instagram.com/johndoe',
            youtube: 'https://youtube.com/johndoe'
        },
        bio: 'A passionate musician bringing soul to the world.',
        status: 'Pending',
    },
    {
        id: 'artist2',
        artistType: 'Band',
        name: 'The Rockers',
        category: 'Music',
        profilePictureUrl: 'https://placehold.co/100x100.png',
        email: 'contact@therockers.com',
        phone: '987-654-3210',
        address: '456 Rock Ave, Los Angeles, CA',
        location: 'London, UK',
        socials: {
            youtube: 'https://youtube.com/therockers'
        },
        bio: 'A band that will rock your world.',
        status: 'Approved',
    },
     {
        id: 'artist3',
        artistType: 'Solo Artist',
        name: 'Jane Smith',
        category: 'Comedy',
        profilePictureUrl: 'https://placehold.co/100x100.png',
        email: 'jane.smith@example.com',
        phone: '555-555-5555',
        address: '789 Laugh St, Chicago, IL',
        location: 'Sydney, Australia',
        socials: {
            facebook: 'https://facebook.com/janesmithcomedy'
        },
        bio: 'Bringing laughter to every corner of the globe.',
        status: 'Rejected',
        rejectionReason: 'Incomplete social media profile verification.',
    },
];
