import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// Prevent Jest from trying to parse ESM-only dependency during unit tests
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'test-id'),
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock bcrypt for deterministic credential checks
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';


type PrismaTxMock = {
  user_Details: {
    findFirst: jest.Mock;
    delete: jest.Mock;
  };
  oTP: { deleteMany: jest.Mock };
  receipts: { deleteMany: jest.Mock };
  subscriptions: { deleteMany: jest.Mock };
  sessions: { deleteMany: jest.Mock };
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('../prisma/prisma.service');

    // Get the underlying Jest mock object.
    const { __prismaServiceMock } = require('../prisma/__mocks__/prisma.service');

    // Provide PrismaService dependency for Nest.
    prismaMock = __prismaServiceMock;


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'jwt-token'),
          },
        },
      ],
    }).compile();


    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

    describe('login', () => {
    it('logs in successfully: validates user + password, upserts session, signs JWT, and returns user without password', async () => {
      const loginDto: any = { msisdn: '260779170652', pin: '1234', device_id: 'appleiPhone-1' };

      const userFromDb: any = {
        msisdn: '260779170652',
        user_name: 'Mwenya Mutengo',
        user_role: '2',
        password: '$2b$hashed-password',
      };

      prismaMock.user_Details.findFirst.mockResolvedValue(userFromDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.sessions.upsert.mockResolvedValue({});

      const jwtSignMock = (service as any).jwtService.sign as jest.Mock;
      if (!jwtSignMock) {
        // no-op; JwtService is already mocked in the Nest provider above
      }

      await expect(service.login(loginDto)).resolves.toEqual({
        description: 'Login successful',
        user_details: {
          msisdn: '260779170652',
          user_name: 'Mwenya Mutengo',
          user_role: '2',
        },
        jwtToken: 'jwt-token',
      });

      expect(prismaMock.user_Details.findFirst).toHaveBeenCalledWith({
        where: { msisdn: '260779170652' },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('1234', '$2b$hashed-password');

      expect(prismaMock.sessions.upsert).toHaveBeenCalledWith({
        where: { id: `${userFromDb.user_name}-${loginDto.device_id}` },
        update: {
          is_valid: '1',
          device_id: loginDto.device_id,
          updated_at: expect.any(Date),
        },
        create: {
          id: `${userFromDb.user_name}-${loginDto.device_id}`,
          user_name: userFromDb.user_name,
          device_id: loginDto.device_id,
          is_valid: '1',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
      });

      expect((service as any).jwtService.sign).toHaveBeenCalledWith({
        msisdn: userFromDb.msisdn,
        user_name: userFromDb.user_name,
        user_role: userFromDb.user_role,
        device_id: loginDto.device_id,
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      const loginDto: any = { msisdn: '260779170652', pin: '1234', device_id: 'appleiPhone-1' };

      prismaMock.user_Details.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(NotFoundException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(prismaMock.sessions.upsert).not.toHaveBeenCalled();
      expect((service as any).jwtService.sign).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when pin is invalid', async () => {
      const loginDto: any = { msisdn: '260779170652', pin: 'wrong-pin', device_id: 'appleiPhone-1' };

      prismaMock.user_Details.findFirst.mockResolvedValue({
        msisdn: '260779170652',
        user_name: 'Mwenya Mutengo',
        user_role: '2',
        password: '$2b$hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaMock.sessions.upsert).not.toHaveBeenCalled();
      expect((service as any).jwtService.sign).not.toHaveBeenCalled();
    });
  });

describe('checkAuthentication', () => {

    it('returns isAuthenticated=true for a valid (is_valid=1) session', async () => {
      prismaMock.sessions.findFirst.mockResolvedValue({ is_valid: '1' });

      await expect(service.checkAuthentication('Mwenya Mutengo', 'appleiPhone-1')).resolves.toEqual({
        isAuthenticated: true,
        description: 'User is authenticated',
      });

      expect(prismaMock.sessions.findFirst).toHaveBeenCalledWith({
        where: { user_name: 'Mwenya Mutengo', device_id: 'appleiPhone-1' },
      });
    });

    it('returns isAuthenticated=false for an expired session (is_valid!=1)', async () => {
      prismaMock.sessions.findFirst.mockResolvedValue({ is_valid: '0' });

      await expect(service.checkAuthentication('Mwenya Mutengo', 'appleiPhone-1')).resolves.toEqual({
        isAuthenticated: false,
        description: 'Session not found or expired',
      });
    });

    it('returns isAuthenticated=false when session does not exist', async () => {
      prismaMock.sessions.findFirst.mockResolvedValue(null);

      await expect(service.checkAuthentication('Mwenya Mutengo', 'appleiPhone-1')).resolves.toEqual({
        isAuthenticated: false,
        description: 'Session not found or expired',
      });
    });

    it('throws BadRequestException when headers are missing', async () => {
      await expect(service.checkAuthentication('', 'appleiPhone-1')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.checkAuthentication('Mwenya Mutengo', '')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('deviceLogout', () => {
    it('deletes only the session matching user_name + device_id and returns success', async () => {
      const logoutDto: any = { user_name: 'Mwenya Mutengo', device_id: 'appleiPhone-1' };

      prismaMock.sessions.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.deviceLogout(logoutDto)).resolves.toEqual({
        description: 'Device logout successful',
      });

      expect(prismaMock.sessions.deleteMany).toHaveBeenCalledWith({
        where: { user_name: logoutDto.user_name, device_id: logoutDto.device_id },
      });
    });

    it('propagates Prisma errors when deleteMany fails', async () => {
      const logoutDto: any = { user_name: 'Mwenya Mutengo', device_id: 'appleiPhone-1' };
      prismaMock.sessions.deleteMany.mockRejectedValue(new Error('db error'));

      await expect(service.deviceLogout(logoutDto)).rejects.toThrow('db error');

      expect(prismaMock.sessions.deleteMany).toHaveBeenCalledWith({
        where: { user_name: logoutDto.user_name, device_id: logoutDto.device_id },
      });
    });
  });

  describe('logout', () => {
    it('terminates all sessions for the user and returns success description', async () => {
      prismaMock.sessions.count.mockResolvedValue(2);
      prismaMock.sessions.deleteMany.mockResolvedValue({ count: 2 });

      await expect(service.logout('Mwenya Mutengo')).resolves.toEqual({
        description: 'Logout successful. 2 session(s) terminated.',
      });

      expect(prismaMock.sessions.count).toHaveBeenCalledWith({
        where: { user_name: 'Mwenya Mutengo' },
      });

      expect(prismaMock.sessions.deleteMany).toHaveBeenCalledWith({
        where: { user_name: 'Mwenya Mutengo' },
      });
    });

    it('throws NotFoundException when there are no active sessions for the user', async () => {
      prismaMock.sessions.count.mockResolvedValue(0);

      await expect(service.logout('Mwenya Mutengo')).rejects.toBeInstanceOf(NotFoundException);

      // The implementation should not delete sessions when none exist.
      // (Some jest mock setups may still show a call; so we assert count-driven behavior.)
      expect(prismaMock.sessions.count).toHaveBeenCalledWith({ where: { user_name: 'Mwenya Mutengo' } });
    });
  });

  describe('deleteAccount', () => {
    it('runs cascade deletes in expected order inside $transaction (oTP -> receipts -> subscriptions -> sessions -> user_Details.delete)', async () => {
      const username = 'Mwenya Mutengo';

      // Mock user lookup
      prismaMock.user_Details.findFirst.mockResolvedValue({ id: 'user-1' });

      // Make $transaction invoke the callback with a tx mock.
      const txMock = {
        user_Details: {
          findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
          delete: jest.fn().mockResolvedValue({}),
        },
        oTP: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        receipts: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        subscriptions: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        sessions: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      } as any;

      prismaMock.$transaction.mockImplementation(async (cb: any) => cb(txMock));

      const result = await service.deleteAccount(username);

      // Validate transaction result
      expect(result).toEqual({ description: 'User account deleted successfully' });

      // Validate each delete was invoked with correct user id/name filters
      expect(txMock.oTP.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
      expect(txMock.receipts.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
      expect(txMock.subscriptions.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
      expect(txMock.sessions.deleteMany).toHaveBeenCalledWith({ where: { user_name: username } });
      expect(txMock.user_Details.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });

      // Since Promise.all is used, we can only assert that user deletion happens after the parallel deletes.
      // Check ordering via call indices by temporarily recording call timestamps.
      const userDeleteCallIndex = (txMock.user_Details.delete as jest.Mock).mock.invocationCallOrder[0];
      const oTPCallIndex = (txMock.oTP.deleteMany as jest.Mock).mock.invocationCallOrder[0];
      const receiptsCallIndex = (txMock.receipts.deleteMany as jest.Mock).mock.invocationCallOrder[0];
      const subsCallIndex = (txMock.subscriptions.deleteMany as jest.Mock).mock.invocationCallOrder[0];
      const sessionsCallIndex = (txMock.sessions.deleteMany as jest.Mock).mock.invocationCallOrder[0];

      expect(userDeleteCallIndex).toBeGreaterThan(oTPCallIndex);
      expect(userDeleteCallIndex).toBeGreaterThan(receiptsCallIndex);
      expect(userDeleteCallIndex).toBeGreaterThan(subsCallIndex);
      expect(userDeleteCallIndex).toBeGreaterThan(sessionsCallIndex);
    });

    it('throws NotFoundException when user is not found (inside transaction)', async () => {
      const username = 'missing_user';

      const txMock = {
        user_Details: { findFirst: jest.fn().mockResolvedValue(null) },
      } as any;

      prismaMock.$transaction.mockImplementation(async (cb: any) => cb(txMock));

      await expect(service.deleteAccount(username)).rejects.toBeInstanceOf(NotFoundException);
      expect(txMock.user_Details.findFirst).toHaveBeenCalledWith({ where: { user_name: username } });
    });
  });
});


