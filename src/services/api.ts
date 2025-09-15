import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: string;
  };
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
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('Attempting login with:', { email, password: '***' });
    console.log('API base URL:', api.defaults.baseURL);
    
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
      email,
      password,
    });
    
    console.log('Login response:', response.data);
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    first_name?: string,
    last_name?: string
  ): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', {
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get('/auth/me');
    return response.data;
  },
};

// Shows API
export const showsAPI = {
  getShows: async (): Promise<{ shows: Show[] }> => {
    const response: AxiosResponse<{ shows: Show[] }> = await api.get('/shows');
    return response.data;
  },

  getShow: async (id: number): Promise<{ show: Show }> => {
    const response: AxiosResponse<{ show: Show }> = await api.get(`/shows/${id}`);
    return response.data;
  },

  createShow: async (showData: ShowCreate): Promise<{ show: Show }> => {
    const response: AxiosResponse<{ show: Show }> = await api.post('/shows', showData);
    return response.data;
  },

  updateShow: async (id: number, showData: ShowCreate): Promise<{ show: Show }> => {
    const response: AxiosResponse<{ show: Show }> = await api.put(`/shows/${id}`, showData);
    return response.data;
  },

  deleteShow: async (id: number): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.delete(`/shows/${id}`);
    return response.data;
  },

  bulkCreateShows: async (shows: ShowCreate[]): Promise<{ shows: Show[]; count: number }> => {
    const response: AxiosResponse<{ shows: Show[]; count: number }> = await api.post('/shows/bulk', {
      shows,
    });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (bio: string) => {
    const response = await api.post('/profile', { bio });
    return response.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateInstruments: async (instruments: string[]) => {
    const response = await api.post('/profile/instruments', { instruments });
    return response.data;
  },

  updateGenres: async (genres: string[]) => {
    const response = await api.post('/profile/genres', { genres });
    return response.data;
  },

  addSocialMedia: async (platform: string, username: string, url?: string) => {
    const response = await api.post('/profile/social-media', { platform, username, url });
    return response.data;
  },

  deleteSocialMedia: async (platform: string) => {
    const response = await api.delete(`/profile/social-media/${platform}`);
    return response.data;
  },

  getOptions: async () => {
    const response = await api.get('/profile/options');
    return response.data;
  },
};

export default api;
