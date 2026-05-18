import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): Partial<ExecutionContext> => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when route is marked as public', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      });

      const result = guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
      // Should stop immediately and not check roles if the route is public
      expect(reflector.getAllAndOverride).not.toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
    });

    it('should return true when no roles are required', () => {
      const context = createMockContext({ user_role: '1' });
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return [];
        return undefined;
      });

      expect(guard.canActivate(context as ExecutionContext)).toBe(true);
    });

    it('should return true when user has the required role', () => {
      const context = createMockContext({ user_role: '1' });
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['1'];
        return undefined;
      });

      expect(guard.canActivate(context as ExecutionContext)).toBe(true);
    });

    it('should throw ForbiddenException when user role does not match', () => {
      const context = createMockContext({ user_role: '2' });
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['1'];
        return undefined;
      });

      expect(() => guard.canActivate(context as ExecutionContext)).toThrow(ForbiddenException);
    });
  });
});