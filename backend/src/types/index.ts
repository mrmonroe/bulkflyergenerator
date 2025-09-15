export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface Show {
  id: number;
  user_id: number;
  date: string;
  venue_name: string;
  venue_address?: string;
  city_state?: string;
  show_time?: string;
  event_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ShowCreate {
  date: string;
  venue_name: string;
  venue_address?: string;
  city_state?: string;
  show_time?: string;
  event_type?: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
}

// User Profile Types
export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string;
  profile_photo_url?: string;
  profile_photo_filename?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfileCreate {
  bio?: string;
  profile_photo_url?: string;
  profile_photo_filename?: string;
}

export interface UserProfileUpdate {
  bio?: string;
  profile_photo_url?: string;
  profile_photo_filename?: string;
}

export interface UserInstrument {
  id: number;
  user_id: number;
  instrument: string;
  created_at: Date;
}

export interface UserGenre {
  id: number;
  user_id: number;
  genre: string;
  created_at: Date;
}

export interface UserSocialMedia {
  id: number;
  user_id: number;
  platform: string;
  username: string;
  url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSocialMediaCreate {
  platform: string;
  username: string;
  url?: string;
}

export interface UserSocialMediaUpdate {
  username: string;
  url?: string;
}

export interface CompleteUserProfile {
  profile: UserProfile;
  instruments: string[];
  genres: string[];
  social_media: UserSocialMedia[];
}

// Constants for instruments and genres
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
