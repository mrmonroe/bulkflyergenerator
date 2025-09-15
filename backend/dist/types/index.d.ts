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
//# sourceMappingURL=index.d.ts.map