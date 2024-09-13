import { threadsCallback } from '../../src/controller/authController.js';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../src/config/auth.js';

jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth.js');

describe('authController', () => {
  describe('threadsCallback', () => {
    let req, res, next;
    let consoleErrorSpy;

    beforeEach(() => {
      req = {
        user: {
          id: 'test_id',
          username: 'test_user',
        },
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('성공적으로 JWT 토큰을 생성하고 응답해야 합니다', () => {
      const mockToken = 'mock_token';
      jwt.sign.mockReturnValue(mockToken);
      authConfig.jwt.secret = 'test_secret';

      threadsCallback(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(req.user, 'test_secret', { expiresIn: '1h' });
      expect(res.json).toHaveBeenCalledWith({ generatedToken: mockToken });
    });

    it('사용자가 없을 경우 401 에러를 반환해야 합니다', () => {
      req.user = null;

      threadsCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '인증되지 않은 사용자입니다.' });
    });

    it('에러 발생 시 500 에러를 반환해야 합니다', () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('Test error');
      });

      threadsCallback(req, res);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Threads 인증 처리 중 오류가 발생했습니다.' });
    });
  });
});
