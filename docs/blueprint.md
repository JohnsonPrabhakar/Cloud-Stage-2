# **App Name**: CloudStage

## Core Features:

- Static Authentication: Implement static authentication to separate artist and admin dashboards using defined credentials.
- Home Page: Build a responsive home page with hero banner, event listing and a tabbed interface to show live, upcoming, and past events. Mobile-first approach with Tailwind CSS.
- Movies Page: Create a separate movies page listing all events in a grid layout with search and filtering by category. Each event links to a detailed view.
- Event Details Page: Develop an event detail page showing full details including title, artist, description, category, date/time, and a YouTube embed.
- Artist Dashboard: Construct a protected artist dashboard accessible only to authenticated artists. Includes event listing, and a button to create new events.
- Event Creation with AI Tool: Design an event creation form, with a button that uses AI to generates dummy description based on video metadata using the YouTube API and allows the artists to customize it to fit their vision for the event.
- Admin Panel: Design a protected admin panel to oversee and manage all events. Display event cards and status using tabs, enabling event approval or rejection.

## Style Guidelines:

- Primary color: Burgundy (#800020) to evoke a sense of sophistication and artistic richness.
- Background color: Light beige (#F5F5DC), a desaturated tint of the primary color.
- Accent color: Olive green (#808000), offering a contrasting hue that complements burgundy and beige, drawing attention to calls to action.
- Font pairing: 'Playfair' (serif) for headlines and titles to convey elegance, paired with 'PT Sans' (sans-serif) for body text, ensuring readability.
- Code Font: 'Source Code Pro' (monospace) for display of YouTube Stream URL or similar, where a monospaced font is useful.
- Simple, line-based icons will be used, related to the different event categories, like musical notes for music, a microphone for stand-up comedy, a book for talks, etc.
- Mobile-first approach with responsive utility classes from Tailwind CSS (flex-col, text-sm, w-full, gap-2, md:grid-cols-2) will be used for scalable design.
- Subtle transition animations when loading new content to enhance user experience. Consider animated tab transitions on the home and admin pages.