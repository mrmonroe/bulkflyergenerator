import { generateAccessToken, generateRefreshToken, verifyToken, generateTokenPair } from '../../utils/jwt';

describe('JWT Utils', () => {
  const testUserId = 1;
  const testEmail = 'test@example.com';

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testUserId, testEmail);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateAccessToken(1, 'user1@example.com');
      const token2 = generateAccessToken(2, 'user2@example.com');
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUserId, testEmail);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testUserId, testEmail);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
      expect(decoded.type).toBe('access');
    });

    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId, testEmail);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });

    it('should throw error for token with wrong secret', () => {
      const token = generateAccessToken(testUserId, testEmail);
      process.env.JWT_SECRET = 'different-secret';
      expect(() => {
        verifyToken(token);
      }).toThrow('Invalid token');
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUserId, testEmail);
      
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
      expect(accessToken).not.toBe(refreshToken);
    });

    it('should generate valid tokens that can be verified', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUserId, testEmail);
      
      const accessDecoded = verifyToken(accessToken);
      const refreshDecoded = verifyToken(refreshToken);
      
      expect(accessDecoded.userId).toBe(testUserId);
      expect(accessDecoded.email).toBe(testEmail);
      expect(accessDecoded.type).toBe('access');
      
      expect(refreshDecoded.userId).toBe(testUserId);
      expect(refreshDecoded.email).toBe(testEmail);
      expect(refreshDecoded.type).toBe('refresh');
    });
  });
});
