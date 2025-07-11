
import type { EventCategory } from './types';

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface TicketsByMonth {
    month: string;
    tickets: number;
}

interface EventSale {
    id: string;
    title: string;
    artistName: string;
    revenue: number;
    date: string;
}

interface TicketSaleDetail {
    id: string;
    title: string;
    artistName: string;
    ticketsSold: number;
    pricePerTicket: number;
    revenue: number;
    date: string;
}

interface RevenueByCategory {
    name: EventCategory;
    value: number;
}

interface ArtistSale {
    artistName: string;
    ticketsSold: number;
    revenue: number;
}


export interface AnalyticsData {
    totalRevenue: number;
    totalTicketsSold: number;
    monthlyRevenue: MonthlyRevenue[];
    ticketsSoldByMonth: TicketsByMonth[];
    topGrossingEvents: EventSale[];
    ticketsByEvent: TicketSaleDetail[];
    revenueByCategory: RevenueByCategory[];
    artistTicketSales: ArtistSale[];
}

export const DUMMY_ANALYTICS_DATA: AnalyticsData = {
    totalRevenue: 82340,
    totalTicketsSold: 5890,
    monthlyRevenue: [
        { month: 'Jan', revenue: 5200 },
        { month: 'Feb', revenue: 7800 },
        { month: 'Mar', revenue: 6500 },
        { month: 'Apr', revenue: 9800 },
        { month: 'May', revenue: 11200 },
        { month: 'Jun', revenue: 4500 },
        { month: 'Jul', revenue: 8800 },
        { month: 'Aug', revenue: 10500 },
        { month: 'Sep', revenue: 7300 },
        { month: 'Oct', revenue: 9500 },
        { month: 'Nov', revenue: 12340 },
        { month: 'Dec', revenue: 15000 },
    ],
    ticketsSoldByMonth: [
        { month: 'Jan', tickets: 450 },
        { month: 'Feb', tickets: 620 },
        { month: 'Mar', tickets: 510 },
        { month: 'Apr', tickets: 780 },
        { month: 'May', tickets: 890 },
        { month: 'Jun', tickets: 350 },
        { month: 'Jul', tickets: 710 },
        { month: 'Aug', tickets: 820 },
        { month: 'Sep', tickets: 600 },
        { month: 'Oct', tickets: 750 },
        { month: 'Nov', tickets: 980 },
        { month: 'Dec', tickets: 1100 },
    ],
    topGrossingEvents: [
        { id: '1', title: 'Acoustic Soul Sessions', artistName: 'Elena Vance', revenue: 15000, date: '2025-05-10T19:00:00Z' },
        { id: '7', title: 'Rock the Night', artistName: 'The Scorchers', revenue: 12500, date: '2025-05-15T19:00:00Z' },
        { id: '2', title: 'Laugh Riot', artistName: 'Sammy G', revenue: 11000, date: '2025-04-20T19:00:00Z' },
        { id: '5', title: 'Mystic Marvels', artistName: 'The Great Fantini', revenue: 9500, date: '2025-06-01T19:00:00Z' },
        { id: '3', title: 'Yoga for Peace', artistName: 'Anna Z', revenue: 8000, date: '2025-04-25T19:00:00Z' },
    ],
    ticketsByEvent: [
        { id: '1', title: 'Acoustic Soul Sessions', artistName: 'Elena Vance', ticketsSold: 150, pricePerTicket: 100, revenue: 15000, date: '2025-05-10T19:00:00Z' },
        { id: '7', title: 'Rock the Night', artistName: 'The Scorchers', ticketsSold: 125, pricePerTicket: 100, revenue: 12500, date: '2025-05-15T19:00:00Z' },
        { id: '2', title: 'Laugh Riot', artistName: 'Sammy G', ticketsSold: 220, pricePerTicket: 50, revenue: 11000, date: '2025-04-20T19:00:00Z' },
        { id: '5', title: 'Mystic Marvels', artistName: 'The Great Fantini', ticketsSold: 95, pricePerTicket: 100, revenue: 9500, date: '2025-06-01T19:00:00Z' },
        { id: '3', title: 'Yoga for Peace', artistName: 'Anna Z', ticketsSold: 160, pricePerTicket: 50, revenue: 8000, date: '2025-04-25T19:00:00Z' },
        { id: '4', title: 'Tech Horizons', artistName: 'Dr. Alex Ray', ticketsSold: 300, pricePerTicket: 0, revenue: 0, date: '2025-03-12T19:00:00Z' },
    ],
    revenueByCategory: [
        { name: 'Music', value: 45000 },
        { name: 'Stand-up Comedy', value: 15000 },
        { name: 'Magic Show', value: 9500 },
        { name: 'Meditation/Yoga', value: 8000 },
        { name: 'Workshop', value: 4840 },
        { name: 'Talk', value: 0 },
        { name: 'Devotional', value: 0 },
    ],
    artistTicketSales: [
        { artistName: 'Elena Vance', ticketsSold: 500, revenue: 25000 },
        { artistName: 'The Scorchers', ticketsSold: 450, revenue: 22500 },
        { artistName: 'Sammy G', ticketsSold: 800, revenue: 20000 },
        { artistName: 'Anna Z', ticketsSold: 600, revenue: 15000 },
        { artistName: 'The Great Fantini', ticketsSold: 300, revenue: 9500 },
    ],
};
