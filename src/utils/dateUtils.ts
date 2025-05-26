/**
 * Format a date for display
 * @param date The date to format (Date object, ISO string, timestamp, or Firestore timestamp)
 * @param format The format to use (full, short, datetime, time, or relative)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number | any, format: 'full' | 'short' | 'datetime' | 'time' | 'relative' = 'full'): string {
  if (!date) return 'N/A';
  
  let dateObj: Date;
  
  try {
    // Convert various date formats to Date object
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (date && typeof date === 'object' && 'seconds' in date) {
      // Firestore Timestamp-like object
      dateObj = new Date(date.seconds * 1000);
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format based on requested format
    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
      case 'short':
        return dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
      case 'datetime':
        return dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
      case 'time':
        return dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        });
        
      case 'relative':
        return formatRelative(dateObj);
        
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
}

/**
 * Convert any date-like value to a JavaScript Date object
 * This function handles different date formats including Firebase Timestamps
 * @param date The date to convert (can be Date, string, number, Firebase Timestamp, etc.)
 * @returns JavaScript Date object or null if invalid
 */
export function toJsDate(date: any): Date | null {
  if (!date) return null;
  
  try {
    // Already a Date object
    if (date instanceof Date) {
      return date;
    }
    
    // String date (ISO format or other string representation)
    if (typeof date === 'string') {
      // Handle ISO dates
      if (date.match(/^\d{4}-\d{2}-\d{2}/) || date.includes('T00:00:00')) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
      
      // Try to parse as a date anyway
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Numeric timestamp (milliseconds since epoch)
    if (typeof date === 'number') {
      return new Date(date);
    }
    
    // Firebase Timestamp with toDate() method
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    // Firebase Timestamp-like object with seconds and nanoseconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000);
    }
    
    // Stringified object that might contain a timestamp
    if (typeof date === 'string' && (date.includes('"seconds"') || date.includes('"nanoseconds"'))) {
      try {
        const parsed = JSON.parse(date);
        if (parsed && typeof parsed === 'object' && 'seconds' in parsed) {
          return new Date(parsed.seconds * 1000);
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error converting to JS Date:', error);
  }
  
  return null;
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
export function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  } else {
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  }
}

/**
 * Format a possible date value safely
 */
export function formatPossibleDate(value: any, format: 'full' | 'short' | 'datetime' | 'time' | 'relative' = 'short'): string {
  if (!value) return 'N/A';
  
  try {
    return formatDate(value, format);
  } catch (error) {
    return String(value);
  }
}

/**
 * Format a date showing completion status
 */
export function formatCompletionDate(date: Date | string | number | null, isCompleted: boolean = false): string {
  if (!date) return isCompleted ? 'Completed (date not recorded)' : 'Not completed';
  
  try {
    const formattedDate = formatDate(date, 'short');
    return isCompleted ? `Completed on ${formattedDate}` : `Expected: ${formattedDate}`;
  } catch (error) {
    return isCompleted ? 'Completed' : 'Pending';
  }
}

/**
 * Get the time remaining or elapsed as a formatted string
 */
export function getTimeRemaining(targetDate: Date | string | number): string {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  
  // Time has passed
  if (now > target) {
    const elapsed = now - target;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${hours} hour${hours !== 1 ? 's' : ''} overdue`;
    }
    
    return `${days} day${days !== 1 ? 's' : ''} overdue`;
  } 
  // Time remains
  else {
    const remaining = target - now;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
    
    return `${days} day${days !== 1 ? 's' : ''} left`;
  }
}

/**
 * Debug helper for date objects
 */
export function debugDate(date: any): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('Date Debug:');
  console.log('Original date value:', date);
  console.log('Type:', typeof date);
  
  const jsDate = toJsDate(date);
  
  console.log('Converted to Date:', jsDate);
  console.log('Valid date?', jsDate && !isNaN(jsDate.getTime()));
  
  if (jsDate && !isNaN(jsDate.getTime())) {
    console.log('ISO string:', jsDate.toISOString());
    console.log('Formatted (short):', formatDate(jsDate, 'short'));
    console.log('Formatted (full):', formatDate(jsDate, 'full'));
  }
  console.groupEnd();
} 