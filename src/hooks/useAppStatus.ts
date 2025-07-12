
'use client';
import { useContext } from 'react';
import { AppStatusContext } from '@/context/AppStatusContext';

export const useAppStatus = () => {
  const context = useContext(AppStatusContext);
  if (context === undefined) {
    throw new Error('useAppStatus must be used within an AppStatusProvider');
  }
  return context;
};
