import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { DeviceLogoutDto } from './dto/logout.dto';
import { DashboardLoginDto } from './dto/dashboard-login.dto';

// Role constants matching User_Role table IDs
const STUDENT_ROLE = '1';
const DASHBOARD_ALLOWED_ROLES = ['2', '3', '4']; // teacher, sales_manager, admin

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user_Details.findFirst({
      where: { msisdn: loginDto.msisdn },
    });

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(loginDto.pin, user.password);
    if (!isValidPassword) throw new BadRequestException('Invalid credentials');

    // Create or refresh session
    await this.prisma.sessions.upsert({
      where: { id: `${user.user_name}-${loginDto.device_id}` },
      update: { is_valid: '1', device_id: loginDto.device_id, updated_at: new Date() },
      create: {
        id: `${user.user_name}-${loginDto.device_id}`,
        user_name: user.user_name,
        device_id: loginDto.device_id,
        is_valid: '1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const { password, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({
      msisdn: user.msisdn,
      user_name: user.user_name,
      user_role: user.user_role,
      device_id: loginDto.device_id,
    });

    return { description: 'Login successful', user_details: userWithoutPassword, jwtToken: token };
  }

  /** Logout all sessions for a user */
  async logout(userName: string) {
    const sessionCount = await this.prisma.sessions.count({ 
      where: { user_name: userName } 
    });
    
    if (sessionCount === 0) {
      throw new NotFoundException(`No active sessions found for user: ${userName}`);
    }
    
    await this.prisma.sessions.deleteMany({ where: { user_name: userName } });
    
    this.logger.log(`User ${userName} logged out from ${sessionCount} session(s)`);
    return { description: `Logout successful. ${sessionCount} session(s) terminated.` };
  }

  /** Fixed B-4: Only deletes the session matching the specific device */
  async deviceLogout(logoutDto: DeviceLogoutDto) {
    await this.prisma.sessions.deleteMany({
      where: { user_name: logoutDto.user_name, device_id: logoutDto.device_id },
    });
    return { description: 'Device logout successful' };
  }

  async checkAuthentication(userName: string, deviceId: string) {
    if (!userName || !deviceId) {
      throw new BadRequestException('user_name and device_id headers are required');
    }

    const session = await this.prisma.sessions.findFirst({
      where: { user_name: userName, device_id: deviceId },
    });

    const isAuthenticated = session?.is_valid === '1';

    return {
      isAuthenticated,
      description: isAuthenticated ? 'User is authenticated' : 'Session not found or expired',
    };
  }

  async dashboardLogin(dashboardLoginDto: DashboardLoginDto) {
    const user = await this.prisma.user_Details.findFirst({
      where: { msisdn: dashboardLoginDto.msisdn },
    });

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(dashboardLoginDto.pin, user.password);
    if (!isValidPassword) throw new BadRequestException('Invalid credentials');

    if (!DASHBOARD_ALLOWED_ROLES.includes(user.user_role)) {
      throw new ForbiddenException('Student accounts cannot access the dashboard');
    }

    const { password, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({
      msisdn: user.msisdn,
      user_name: user.user_name,
      user_role: user.user_role,
      device_id: dashboardLoginDto.device_id,
    });

    return { description: 'Login successful', user_details: userWithoutPassword, jwtToken: token };
  }

  async deleteRequest(msisdn: string) {
    if (!msisdn) throw new BadRequestException('MSISDN is required');

    // Check if request already exists
    const existing = await this.prisma.deletion_Requests.findFirst({ where: { msisdn } });
    if (existing) {
      throw new BadRequestException(`Deletion request already pending for ${msisdn}. Status: ${existing.status}`);
    }

    // Create deletion request in queue
    await this.prisma.deletion_Requests.create({
      data: {
        msisdn,
        requested_at: new Date(),
        status: 'pending',
      },
    });

    this.logger.log(`Deletion request queued for ${msisdn}`);
    return { statusCode: 200, message: `Deletion request queued for ${msisdn}. Admin review pending.` };
  }

async deleteAccount(usernameOrDto: string | { username: string }) {
    const username = typeof usernameOrDto === 'string' ? usernameOrDto : usernameOrDto.username;
    // 1. Perform the transaction
    await this.prisma.$transaction(async (tx) => {
      // Find user first to get the internal ID
      const user = await tx.user_Details.findFirst({
        where: { user_name: username }
      });

      if (!user) {
        throw new NotFoundException(`User ${username} not found`);
      }

      // 2. Clear all related records using the user ID
      // Order matters if you have foreign key constraints!
      await Promise.all([
        tx.oTP.deleteMany({ where: { user_id: user.id } }),
        tx.receipts.deleteMany({ where: { user_id: user.id } }),
        tx.subscriptions.deleteMany({ where: { user_id: user.id } }),
        tx.sessions.deleteMany({ where: { user_name: username } }),
      ]);

      // 3. Final deletion of the primary user record
      await tx.user_Details.delete({ where: { id: user.id } });
    });

    // 4. Return raw object (NestJS handles the 200 status code)
    return { description: 'User account deleted successfully' };
  }

  async getDeleteRequest(username: string) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    // Find deletion request by user_name or fallback to msisdn lookup
    const user = await this.prisma.user_Details.findFirst({
      where: { user_name: username },
      select: { msisdn: true }
    });

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    const deletionRequest = await this.prisma.deletion_Requests.findFirst({
      where: { 
        OR: [
          { user_name: username },
          { msisdn: user.msisdn }
        ]
      }
    });

    if (!deletionRequest) {
      throw new NotFoundException(`No deletion request found for ${username}`);
    }

    this.logger.log(`Deletion request status retrieved for ${username}: ${deletionRequest.status}`);

    // Return structured response
    return {
      statusCode: 200,
      data: {
        id: deletionRequest.id,
        msisdn: deletionRequest.msisdn,
        user_name: deletionRequest.user_name,
        status: deletionRequest.status,
        requested_at: deletionRequest.requested_at,
        processed_at: deletionRequest.processed_at,
        notes: deletionRequest.notes
      }
    };
  }
}
