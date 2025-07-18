'use client';
import { useContext } from 'react';
import { EventContext } from '@/context/EventContext';

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
