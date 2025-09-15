import { JwtPayload } from '../types';
export declare const generateAccessToken: (userId: number, email: string) => string;
export declare const generateRefreshToken: (userId: number, email: string) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const generateTokenPair: (userId: number, email: string) => {
    accessToken: string;
    refreshToken: string;
};
//# sourceMappingURL=jwt.d.ts.map