export interface Show {
  Date: string;
  'Venue Name': string;
  'Venue Address': string;
  'Show Time': string;
  [key: string]: string;
}

export interface FlyerData {
  date: string;
  venueName: string;
  venueAddress: string;
  cityState: string;
  showTime: string;
  eventType: string;
}

export interface ExportOptions {
  width: number;
  height: number;
  platform: 'instagram' | 'facebook' | 'custom';
}

export interface FlyerStyle {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
}

export const FLYER_STYLES: FlyerStyle[] = [
  { id: 'modern', name: 'Modern', primaryColor: '#231F20', accentColor: '#caa12b' },
  { id: 'vintage', name: 'Vintage', primaryColor: '#231F20', accentColor: '#caa12b' },
  { id: 'minimal', name: 'Minimal', primaryColor: '#231F20', accentColor: '#caa12b' },
  { id: 'rock', name: 'Rock', primaryColor: '#231F20', accentColor: '#caa12b' },
  { id: 'jazz', name: 'Jazz', primaryColor: '#231F20', accentColor: '#caa12b' }
];
