'use client';
import { useContext } from 'react';
import { ArtistContext } from '@/context/ArtistContext';

export const useArtists = () => {
  const context = useContext(ArtistContext);
  if (context === undefined) {
    throw new Error('useArtists must be used within an ArtistProvider');
  }
  return context;
};
