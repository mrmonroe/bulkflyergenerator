import { Request, Response, NextFunction } from 'express';
import { UserResponse } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: UserResponse;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map