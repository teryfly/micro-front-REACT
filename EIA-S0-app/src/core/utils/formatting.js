/**
 * Formatting Utilities
 * Date, string, and number formatting
 * @module utils/formatting
 */

import { format, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (err) {
    console.error('Date formatting error:', err);
    return '-';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diff = now - dateObj;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch (err) {
    console.error('Relative time formatting error:', err);
    return '-';
  }
};

export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const snakeToTitle = (str) => {
  if (!str) return '';
  return str.split('_').map(word => capitalize(word)).join(' ');
};