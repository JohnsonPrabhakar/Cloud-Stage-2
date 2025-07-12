
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
    totalRevenue: 0,
    totalTicketsSold: 0,
    monthlyRevenue: [],
    ticketsSoldByMonth: [],
    topGrossingEvents: [],
    ticketsByEvent: [],
    revenueByCategory: [],
    artistTicketSales: [],
};
