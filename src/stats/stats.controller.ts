import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { StatsDto } from './dto/stats.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Query } from '@nestjs/common';
import { DateRangeDto } from './dto/date-range.dto';

@ApiTags('Stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ─── General Stats ───────────────────────────────────────────────────────

  @ApiTags('Stats')
  @Get('getAppUsers')
  @ApiOperation({ summary: 'Get unsubscribed app users', description: 'Returns a list of users with the basic student role (unsubscribed).' })
  @ApiResponse({ status: 200, description: 'List of unsubscribed users.' })
  async getAppUsers() {
    return this.statsService.getAppUsers();
  }

  @ApiTags('Stats')
  @Get('stats-exam/:id')

  @ApiParam({ name: 'id', description: 'Exam ID', type: StatsDto })
  @ApiOperation({ summary: '[Stats] Get exam by ID (stats view)', description: 'Returns exam details for stats display.' })
  @ApiResponse({ status: 200, description: 'Exam details.' })
  async getExam(@Param('id') id: string) {
    return this.statsService.getExam(id);
  }

  @ApiTags('Stats')
  @Get('stats-all-exams')

  @ApiOperation({ summary: '[Stats] Get all exams (stats view)', description: 'Returns all exams for stats reporting.' })
  @ApiResponse({ status: 200, description: 'All exams.' })
  async getAllExams() {
    return this.statsService.getAllExams();
  }

  @ApiTags('Stats')
  @Get('stats-exam-content/:id')

  @ApiOperation({ summary: '[Stats] Get exam content by exam ID', description: 'Returns all content records for the given exam.' })
  @ApiParam({ name: 'id', description: 'Exam ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Exam content records.' })
  async getExamContent(@Param('id') id: string) {
    return this.statsService.getExamContent(id);
  }

  @ApiTags('Stats')
  @Get('stats-all-exam-content')

  @ApiOperation({ summary: '[Stats] Get all exam content (stats view)', description: 'Returns all exam content records.' })
  @ApiResponse({ status: 200, description: 'All exam content.' })
  async getAllExamContent() {
    return this.statsService.getAllExamContent();
  }

  @ApiTags('Stats')
  @Get('stats-exam-by-subject/:id')
  @ApiOperation({ summary: '[Stats] Get exams by subject (stats view)', description: 'Returns all exams grouped under a subject.' })
  @ApiParam({ name: 'id', description: 'Subject ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Exams for subject.' })
  async getExamBySubject(@Param('id') id: string) {
    return this.statsService.getExamBySubject(id);
  }


  // ─── Admin Stats ──────────────────────────────────────────────────────────

@ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/user-data')
  @ApiOperation({ 
    summary: '[ADMIN] Get all user data', 
    description: 'Returns full user records with optional date range filtering.' 
  })
  @ApiResponse({ status: 200, description: 'Filtered user data.' })
  async getUserData(@Query() filters: DateRangeDto) {
    return this.statsService.getUserData(filters);
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/weekly-subscriptions')
  @ApiOperation({ summary: '[ADMIN] Get weekly subscriptions', description: 'Returns all subscriptions created in the last 7 days.' })
  @ApiResponse({ status: 200, description: 'Weekly subscriptions.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getWeeklySubscriptions() {
    return this.statsService.getWeeklySubscriptions();
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/weekly-app-users')
  @ApiOperation({ summary: '[ADMIN] Get weekly new app users', description: 'Returns users registered in the last 7 days.' })
  @ApiResponse({ status: 200, description: 'Weekly new users.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
 async getWeeklyAppUsers() {
    return this.statsService.getWeeklyAppUsers();
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/daily-new-user')
  @ApiOperation({ summary: "[ADMIN] Get today's new users", description: 'Returns count of users registered today, with subscription and referral counts.' })
  @ApiResponse({ status: 200, description: 'Daily new user stats.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getDailyNewUser() {
    return this.statsService.getDailyNewUser();
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/teacher-referral-subscriptions')
  @ApiOperation({ summary: '[ADMIN] Get teacher referral subscriptions', description: 'Returns all teachers with their referral-based subscription records.' })
  @ApiResponse({ status: 200, description: 'Teacher referral subscriptions.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getTeacherReferralSubscriptions() {
    return this.statsService.getTeacherReferralSubscriptions();
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/admin-referral-subscriptions')
  @ApiOperation({ summary: '[ADMIN] Get admin referral subscriptions', description: 'Returns subscriptions generated through admin referral codes.' })
  @ApiResponse({ status: 200, description: 'Admin referral subscriptions.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAdminReferralSubscriptions() {
    return this.statsService.getAdminReferralSubscriptions();
  }

  @ApiTags('Stats - Admin')
  @Roles('4')
  @Get('admin/total-stats')
  @ApiOperation({ summary: '[ADMIN] Get total platform stats', description: 'Returns aggregate counts: total users, active users, teachers, and total revenue.' })
  @ApiResponse({ status: 200, description: 'Total platform statistics.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAdminTotalStats() {
    return this.statsService.getAdminTotalStats();
  }

  // ─── Sales Manager Stats ──────────────────────────────────────────────────

  @ApiTags('Stats - Sales Manager')
  @Roles('3', '4')
  @Get('sales-manager/teachers/:id')
  @ApiOperation({ summary: '[SALES MANAGER] Get teachers under manager', description: 'Returns all teachers managed by the given sales manager.' })
  @ApiParam({ name: 'id', description: 'Sales manager user ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Teachers under this sales manager.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getTeachersUnderSalesManager(@Param('id') id: string) {
    return this.statsService.getTeachersUnderSalesManager(id);
  }

  @ApiTags('Stats - Sales Manager')
  @Roles('3', '4')
  @Get('sales-manager/teacher-count/:id')
  @ApiOperation({ summary: '[SALES MANAGER] Get teacher count', description: 'Returns the count of teachers under a sales manager.' })
  @ApiParam({ name: 'id', description: 'Sales manager user ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Teacher count.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getCountOfTeachersUnderSalesManager(@Param('id') id: string) {
    return this.statsService.getCountOfTeachersUnderSalesManager(id);
  }

  @ApiTags('Stats - Sales Manager')
  @Roles('3', '4')
  @Get('sales-manager/referral-count/:id')
  @ApiOperation({ summary: '[SALES MANAGER] Get referral count', description: 'Returns count of referrals attributed to teachers under this sales manager.' })
  @ApiParam({ name: 'id', description: 'Sales manager user ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Referral count.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getCountOfReferralsUnderSalesManager(@Param('id') id: string) {
    return this.statsService.getCountOfReferralsUnderSalesManager(id);
  }

  // ─── Teacher Stats ────────────────────────────────────────────────────────

  @ApiTags('Stats - Teacher')
  @Roles('2', '3', '4')
  @Get('teachers/active-students/:id')
  @ApiOperation({ summary: "[TEACHER] Get active students using referral", description: "Returns active students subscribed via this teacher's referral code." })
  @ApiParam({ name: 'id', description: 'Teacher user ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Active students.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getStudentsActivelyUsingReferral(@Param('id') id: string) {
    return this.statsService.getStudentsActivelyUsingReferral(id);
  }

  @ApiTags('Stats - Teacher')
  @Roles('2', '3', '4')
  @Get('teachers/student-subscriptions/:id')
  @ApiOperation({ summary: '[TEACHER] Get student subscription stats', description: "Returns count and subscription details of students using this teacher's referral." })
  @ApiParam({ name: 'id', description: 'Teacher user ID', type: StatsDto })
  @ApiResponse({ status: 200, description: 'Student subscription data.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getCountAndSubscriptionsOfStudentUsingTeacherReferral(@Param('id') id: string) {
    return this.statsService.getCountAndSubscriptionsOfStudentUsingTeacherReferral(id);
  }
}

