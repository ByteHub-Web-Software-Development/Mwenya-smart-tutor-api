/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Headers } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto, DeviceLogoutDto } from './dto/logout.dto';
import { DeleteRequestDto } from './dto/delete-request.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { Public } from '../common/decorators/public.decorator';
import { DashboardLoginDto } from './dto/dashboard-login.dto';
import { date } from 'joi';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Student/user login', description: 'Authenticates a user with MSISDN and PIN. Returns a JWT token on success.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — returns user details and JWT token.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user (all sessions)', description: 'Deletes all active sessions for the given username.' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.user_name);
  }

  @ApiBearerAuth()
  @Post('devicelogout')
  @ApiOperation({ summary: 'Logout specific device', description: 'Deletes only the session associated with the given device_id.' })
  @ApiBody({ type: DeviceLogoutDto })
  @ApiResponse({ status: 200, description: 'Device logout successful.' })
async deviceLogout(@Body() logoutDto: DeviceLogoutDto) {
    return this.authService.deviceLogout(logoutDto);
  }

  @ApiBearerAuth()
  @Get('authenticated')
  @ApiOperation({
    summary: 'Check authentication status',
    description: 'Validates an active session for the given username and device.'
  })
  // This explicitly tells Scalar to show these as required fields in the UI
  @ApiHeader({ name: 'user_name', description: 'The registered MSISDN/Username', required: true })
  @ApiHeader({ name: 'device_id', description: 'Unique ID for the device', required: true })
  @ApiResponse({ status: 200, description: 'Returns isAuthenticated boolean.' })
  async checkAuthentication(
    @Headers('user_name') userName: string,
    @Headers('device_id') deviceId: string,
  ) {
    return this.authService.checkAuthentication(userName, deviceId);
  }

  @Public()
  @Post('dashboard/login')
  @ApiOperation({ summary: 'Dashboard login (admin/teacher/sales manager)', description: 'Authenticates privileged users. Returns 403 for student accounts.' })
  @ApiBody({ type: DashboardLoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — returns user details and JWT token.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @ApiResponse({ status: 403, description: 'Access denied — student accounts cannot access the dashboard.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async dashboardLogin(@Body() dashboardLoginDto: DashboardLoginDto) {
    return this.authService.dashboardLogin(dashboardLoginDto);
  }

  @Public()
  @Post('delete-request')
  @ApiOperation({ summary: 'Request account deletion', description: 'Submits a request to delete an account by MSISDN.' })
  @ApiBody({ type: DeleteRequestDto })
  @ApiResponse({ status: 200, description: 'Deletion request received.' })
  @ApiResponse({ status: 400, description: 'MSISDN is required.' })
  async deleteRequest(@Body() deleteDto: DeleteRequestDto) {
    return this.authService.deleteRequest(deleteDto.msisdn);
  }

@Public()
  @Post('account/delete')
  @ApiOperation({ summary: 'Delete user account', description: 'Permanently deletes a user account, cascading through sessions, OTPs, and receipts.' })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({ status: 200, description: 'Account deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteAccount(@Body() deleteDto: DeleteAccountDto) {
    return this.authService.deleteAccount(deleteDto.username);
  }

  @Public()
  @Get('delete-request/:username')
  @ApiOperation({ summary: 'Get deletion request status', description: 'Returns the current status of a pending account deletion request.' })
  @ApiParam({ name: 'username', description: 'Username to check deletion status for' })
  @ApiResponse({ status: 200, description: 'Deletion request status returned.' })
  async getDeleteRequest(@Param('username') username: string) {
    return this.authService.getDeleteRequest(username);
  }
}
