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

// User Profile Types
export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string;
  profile_photo_url?: string;
  profile_photo_filename?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSocialMedia {
  id: number;
  user_id: number;
  platform: string;
  username: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface CompleteUserProfile {
  profile: UserProfile | null;
  instruments: string[];
  genres: string[];
  social_media: UserSocialMedia[];
}

export const INSTRUMENTS = [
  'Vocals',
  'Guitar',
  'Bass',
  'Drums',
  'Piano',
  'Keyboard',
  'Saxophone',
  'Trumpet',
  'Violin',
  'Cello',
  'Flute',
  'Clarinet',
  'Harmonica',
  'Banjo',
  'Mandolin',
  'Ukulele',
  'Other'
];

export const GENRES = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Folk',
  'Classical',
  'Electronic',
  'Hip-Hop',
  'R&B',
  'Soul',
  'Funk',
  'Reggae',
  'Alternative',
  'Indie',
  'Punk',
  'Metal',
  'Gospel',
  'Latin',
  'World',
  'Other'
];

export const SOCIAL_MEDIA_PLATFORMS = [
  'Instagram',
  'Facebook',
  'Twitter',
  'TikTok',
  'YouTube',
  'Spotify',
  'SoundCloud',
  'Bandcamp',
  'LinkedIn',
  'Other'
];

