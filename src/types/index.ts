export interface Show {
  id: number;
  user_id: number;
  date: string;
  venue_name: string;
  venue_address?: string;
  city_state?: string;
  show_time?: string;
  event_type?: string;
  latitude?: number;
  longitude?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowCreate {
  date: string;
  venue_name: string;
  venue_address?: string;
  city_state?: string;
  show_time?: string;
  event_type?: string;
  latitude?: number;
  longitude?: number;
  is_public?: boolean;
}

// Legacy Show interface for CSV parsing
export interface LegacyShow {
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

// Template System Types
export interface TemplateField {
  id: string;
  type: 'text' | 'date' | 'time' | 'venue' | 'address' | 'price' | 'description';
  label: string;
  x: number; // Position in pixels
  y: number; // Position in pixels
  width: number; // Width in pixels
  height: number; // Height in pixels
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  maxLength?: number;
  placeholder?: string;
  showLabel?: boolean;
  isRequired?: boolean;
}

export interface FlyerTemplate {
  id: string;
  name: string;
  description?: string;
  userId: number;
  backgroundImage?: string; // Base64 or URL
  backgroundImageFile?: File;
  width: number; // Template width in pixels
  height: number; // Template height in pixels
  fields: TemplateField[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFieldConfig {
  type: TemplateField['type'];
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFontSize: number;
  defaultFontWeight: TemplateField['fontWeight'];
  defaultFontFamily: string;
  defaultColor: string;
  placeholder?: string;
  maxLength?: number;
}

export const TEMPLATE_FIELD_TYPES: TemplateFieldConfig[] = [
  {
    type: 'venue',
    label: 'Venue Name',
    defaultWidth: 300,
    defaultHeight: 40,
    defaultFontSize: 24,
    defaultFontWeight: 'bold',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 50
  },
  {
    type: 'date',
    label: 'Date',
    defaultWidth: 200,
    defaultHeight: 30,
    defaultFontSize: 18,
    defaultFontWeight: 'normal',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 20
  },
  {
    type: 'time',
    label: 'Time',
    defaultWidth: 150,
    defaultHeight: 30,
    defaultFontSize: 18,
    defaultFontWeight: 'normal',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 10
  },
  {
    type: 'address',
    label: 'Address',
    defaultWidth: 300,
    defaultHeight: 60,
    defaultFontSize: 14,
    defaultFontWeight: 'normal',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 100
  },
  {
    type: 'price',
    label: 'Ticket Price',
    defaultWidth: 120,
    defaultHeight: 30,
    defaultFontSize: 16,
    defaultFontWeight: 'bold',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 20
  },
  {
    type: 'description',
    label: 'Description',
    defaultWidth: 400,
    defaultHeight: 80,
    defaultFontSize: 14,
    defaultFontWeight: 'normal',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 200
  },
  {
    type: 'text',
    label: 'Custom Text',
    defaultWidth: 200,
    defaultHeight: 30,
    defaultFontSize: 16,
    defaultFontWeight: 'normal',
    defaultFontFamily: 'Arial, sans-serif',
    defaultColor: '#ffffff',
    maxLength: 50
  }
];

export const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Courier New, monospace'
];

export const FONT_WEIGHTS: TemplateField['fontWeight'][] = [
  'normal',
  'bold',
  'lighter',
  'bolder',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900'
];

