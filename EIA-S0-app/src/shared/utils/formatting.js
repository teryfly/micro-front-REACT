/**
 * Formatting Utilities Module
 * Date, string, and number formatting functions
 * @module formatting
 */

import { format, parseISO } from 'date-fns';

/**
 * Format date to readable string
 * @param {string|Date} date - Date object or ISO string
 * @param {string} [formatString='yyyy-MM-dd HH:mm:ss'] - Format pattern (date-fns format)
 * @returns {string} Formatted date string or '-' if invalid
 * 
 * @example
 * formatDate('2024-12-19T10:30:00Z') // Returns: "2024-12-19 10:30:00"
 * formatDate(new Date(), 'yyyy-MM-dd') // Returns: "2024-12-19"
 * formatDate(null) // Returns: "-"
 */
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

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date object or ISO string
 * @returns {string} Relative time string or '-' if invalid
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // Returns: "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000 * 3)) // Returns: "3 days ago"
 * formatRelativeTime(new Date(Date.now() - 30000)) // Returns: "Just now"
 */
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

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} [maxLength=50] - Maximum length before truncation
 * @returns {string} Truncated string with '...' or original string
 * 
 * @example
 * truncate('This is a very long string', 10) // Returns: "This is a..."
 * truncate('Short', 10) // Returns: "Short"
 * truncate(null, 10) // Returns: ""
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB")
 * 
 * @example
 * formatFileSize(0) // Returns: "0 Bytes"
 * formatFileSize(1536) // Returns: "1.5 KB"
 * formatFileSize(1048576) // Returns: "1 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * capitalize('hello') // Returns: "Hello"
 * capitalize('WORLD') // Returns: "WORLD"
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to Title Case
 * @param {string} str - Snake case string
 * @returns {string} Title case string
 * 
 * @example
 * snakeToTitle('hello_world') // Returns: "Hello World"
 * snakeToTitle('ai_service_config') // Returns: "Ai Service Config"
 */
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};