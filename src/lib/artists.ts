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
        name: 'Elena Vance',
        category: 'Music',
        profilePictureUrl: 'https://placehold.co/100x100.png',
        email: 'artist@cloudstage.live',
        phone: '123-456-7890',
        address: '123 Music Lane, Nashville, TN',
        location: 'New York, USA',
        socials: {
            instagram: 'https://instagram.com/elenavance',
            youtube: 'https://youtube.com/elenavance'
        },
        bio: 'A passionate musician bringing soul to the world.',
        status: 'Approved',
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
    {
        id: 'artist4',
        artistType: 'Solo Artist',
        name: 'Sammy G',
        category: 'Stand-up Comedy',
        profilePictureUrl: 'https://placehold.co/100x100.png',
        email: 'sammyg@example.com',
        phone: '111-222-3333',
        address: '101 Joke Rd, New York, NY',
        location: 'New York, USA',
        socials: {
            instagram: 'https://instagram.com/sammyg'
        },
        bio: 'Just here to make you laugh.',
        status: 'Pending',
    },
];
