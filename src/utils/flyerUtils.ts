import { Show, LegacyShow, FlyerData } from '../types';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'TBD';
  
  // Remove ordinal suffixes (th, st, nd, rd)
  return dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return 'TBD';
  
  // Clean up time format
  return timeString.replace(/(\d+):(\d+)(am|pm)/, '$1:$2$3');
};

export const parseVenueAddress = (address: string): { address: string; cityState: string } => {
  if (!address) return { address: '', cityState: '' };
  
  // Remove quotes from the beginning and end
  const cleanAddress = address.replace(/^["']|["']$/g, '');
  
  if (cleanAddress.includes(',')) {
    const parts = cleanAddress.split(',');
    if (parts.length >= 2) {
      return {
        address: parts[0].trim(),
        cityState: parts.slice(1).join(',').trim()
      };
    }
  }
  
  return { address: cleanAddress, cityState: '' };
};

// Convert new Show interface to FlyerData
export const convertShowToFlyerData = (show: Show): FlyerData => {
  const { address, cityState } = parseVenueAddress(show.venue_address || '');
  
  return {
    date: formatDate(show.date || ''),
    venueName: show.venue_name || 'Venue TBD',
    venueAddress: address,
    cityState: cityState || show.city_state || '',
    showTime: formatTime(show.show_time || ''),
    eventType: show.event_type || 'Live Acoustic Music'
  };
};

// Convert legacy Show interface to FlyerData
export const convertLegacyShowToFlyerData = (show: LegacyShow): FlyerData => {
  const { address, cityState } = parseVenueAddress(show['Venue Address'] || '');
  
  return {
    date: formatDate(show.Date || ''),
    venueName: show['Venue Name'] || 'Venue TBD',
    venueAddress: address,
    cityState: cityState,
    showTime: formatTime(show['Show Time'] || ''),
    eventType: 'Live Acoustic Music'
  };
};

export const getMonthFromDate = (dateString: string): string | null => {
  if (!dateString) return null;
  
  // Handle various date formats
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString('en-US', { month: 'long' });
  }
  
  // Handle text dates like "Aug 20th", "August 27th"
  const monthMatch = dateString.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)/i);
  if (monthMatch) {
    const month = monthMatch[1];
    // Convert abbreviations to full names
    const monthMap: { [key: string]: string } = {
      'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
      'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
      'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
    };
    return monthMap[month] || month;
  }
  
  return null;
};

