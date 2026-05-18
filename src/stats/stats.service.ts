import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { StatsResponse } from '../types/stat-types';
import { DateRangeDto } from './dto/date-range.dto';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAppUsers(): Promise<StatsResponse> {
    const users = await this.prisma.user_Details.findMany({
      where: { user_role: '1', user_status: '1' },
      select: { id: true, created_at: true, device_id: true, msisdn: true, updated_at: true, user_name: true },
    });

    return {
      statusCode: 200,
      message: {
        description: 'Active unsubscribed app users',
        count: users.length,
        users,
      },
    };

  }

  async getExam(id: string): Promise<StatsResponse> {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) return { statusCode: 200, message: { description: 'No exam found' } };
    return { statusCode: 200, message: { exam } };
  }

  async getAllExams(): Promise<StatsResponse> {
    const exams = await this.prisma.exam.findMany();
    return { statusCode: 200, message: { exams } };
  }

  async getExamContent(id: string): Promise<StatsResponse> {
    const examContent = await this.prisma.exam_content.findMany({ where: { examId: id } });
    if (!examContent.length) return { statusCode: 200, message: { description: 'No exam content found' } };
    return { statusCode: 200, message: { examContent } };
  }


  async getAllExamContent(): Promise<StatsResponse> {
    const examContents = await this.prisma.exam_content.findMany();
    return { statusCode: 200, message: { examContents } };
  }



  async getExamBySubject(id: string): Promise<StatsResponse> {
    const exams = await this.prisma.exam.findMany({ where: { subject_id: id } });
    return { statusCode: 200, message: { exams } };
  }


  // ─── Admin Stats ──────────────────────────────────────────────────────────


// src/stats/stats.service.ts

async getUserData(filters: DateRangeDto): Promise<StatsResponse> {
  try {
    const { startDate, endDate } = filters;
    const where: any = {};

    // Apply date range filter if dates are provided
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    const userData = await this.prisma.user_Details.findMany({
      where,
      include: { subscriptions: true },
      orderBy: { created_at: 'desc' }, // Good practice for admin views
    });

    return { statusCode: 200, message: { userData, count: userData.length } };
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
}
// 1. Weekly Subscriptions Grouped by Day
  async getWeeklySubscriptions() {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Grouping by created_at in MongoDB via Prisma
      const aggregations = await this.prisma.subscriptions.groupBy({
        by: ['created_at', 'subscription_type'],
        where: {
          created_at: { gte: weekAgo },
        },
        _count: { _all: true },
        _sum: { amount: true },
      });

      return { statusCode: 200, message: { weeklySubscriptions: aggregations } };
    } catch (error: any) {
    throw new InternalServerErrorException(error.message);
    }
  }


  
  async getWeeklyAppUsers() {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const userGroups = await this.prisma.user_Details.groupBy({
        by: ['created_at', 'user_role'],
        where: {
          created_at: { gte: weekAgo },
        },
        _count: { _all: true },
      });

      return { statusCode: 200, message: { weeklyUsers: userGroups } };
    } catch (error: any) {
    throw new InternalServerErrorException(error.message);
    }
  }

  async getDailyNewUser() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await this.prisma.user_Details.groupBy({
        by: ['user_role', 'user_status'],
        where: {
          created_at: { gte: today },
        },
        _count: {
          _all: true,
          referral_code: true, // Counts how many had a referral code
        },
      });

      return { statusCode: 200, message: { dailyStats: stats } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // ─── Admin Referral Subscriptions ───────────────────────────────────────

  // Admin: Get teacher referral subscriptions
  // Aggregation note: Prisma schema shows:
  // - Subscriptions have `user_id` -> User_Details
  // - Referrals are represented by `User_Details.referral_code` on the *referred user*
  // - Code owner (teacher/admin) is the user whose `referral_code` matches

  async getTeacherReferralSubscriptions(): Promise<StatsResponse> {
    try {
      // Teachers who own referral codes
      const teachers = await this.prisma.user_Details.findMany({
        where: { user_role: '2', referral_code: { not: null } },
        select: { msisdn: true, referral_code: true, user_name: true },
      });

      const teacherStats = await Promise.all(
        teachers.map(async (t) => {
          if (!t.referral_code) {
            return {
              name: t.user_name,
              code: null,
              totalRevenue: 0,
              totalStudents: 0,
            };
          }

          // Referred users are those with their own `referral_code` set to the teacher's code.
          const stats = await this.prisma.subscriptions.aggregate({
            where: {
              user: {
                referral_code: t.referral_code,
              },
            },
            _sum: { amount: true },
            _count: { _all: true },
          });

          return {
            name: t.user_name,
            code: t.referral_code,
            totalRevenue: stats._sum.amount || 0,
            totalStudents: stats._count._all,
          };
        }),
      );

      return { statusCode: 200, message: { teacherReferrals: teacherStats } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Admin: Get admin referral subscriptions
  async getAdminReferralSubscriptions(): Promise<StatsResponse> {
    try {
      // Admins who own referral codes
      const admins = await this.prisma.user_Details.findMany({
        where: {
          user_role: '3',
          referral_code: { not: null },
        },
        select: { id: true, user_name: true, referral_code: true },
      });

      const report = await Promise.all(
        admins.map(async (admin) => {
          if (!admin.referral_code) {
            return {
              adminName: admin.user_name,
              code: null,
              totalConversions: 0,
              totalRevenue: 0,
            };
          }

          const stats = await this.prisma.subscriptions.aggregate({
            where: {
              user: {
                referral_code: admin.referral_code,
              },
            },
            _count: { _all: true },
            _sum: { amount: true },
          });

          return {
            adminName: admin.user_name,
            code: admin.referral_code,
            totalConversions: stats._count._all,
            totalRevenue: stats._sum.amount ?? 0,
          };
        }),
      );

      return { statusCode: 200, message: { adminReferralStats: report } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }


  async getAdminTotalStats(): Promise<StatsResponse> {
    try {
      const [
        totalUsers,
        totalSubscriptions,
        activeUsers,
        totalRevenue,
        teachers,
      ] = await Promise.all([
        this.prisma.user_Details.count(),
        this.prisma.subscriptions.count(),
        this.prisma.user_Details.count({ where: { user_status: '1' } }),
        this.prisma.subscriptions.aggregate({ _sum: { amount: true } }),
        this.prisma.user_Details.count({ where: { user_role: '2' } }),
      ]);

      const revenueTotal = totalRevenue?._sum?.amount ?? 0;

      return {
        statusCode: 200,
        message: {
          totalUsers,
          totalSubscriptions,
          activeUsers,
          revenueTotal,
        },
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }


  // ─── Sales Manager Stats ──────────────────────────────────────────────────

  async getTeachersUnderSalesManager(managerId: string): Promise<StatsResponse> {
    try {
      const teachers = await this.prisma.user_Details.findMany({
        where: { sales_manager_id: managerId, user_role: '2' },
      });
      return { statusCode: 200, message: { teachers } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCountOfTeachersUnderSalesManager(managerId: string): Promise<StatsResponse> {
    try {
      const count = await this.prisma.user_Details.count({
        where: { sales_manager_id: managerId, user_role: '2' },
      });
      return { statusCode: 200, message: { teacherCount: count } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCountOfReferralsUnderSalesManager(managerId: string): Promise<StatsResponse> {
    try {
    
      const referralCount = await this.prisma.user_Details.count({
        where: {
          referral_code: { not: null },
          managed_by: { sales_manager_id: managerId },
        },
      });
      return { statusCode: 200, message: { referralCount } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // ─── Teacher Stats ────────────────────────────────────────────────────────

  async getStudentsActivelyUsingReferral(teacherId: string): Promise<StatsResponse> {
    try {
      const teacher = await this.prisma.user_Details.findUnique({
        where: { id: teacherId },
        select: { referral_code: true },
      });

    if (!teacher) {
    return { statusCode: 404, message: { description: 'Teacher record not found' } };
            }
    if (!teacher.referral_code) {
    return { statusCode: 200, message: { description: 'This teacher has not set up a referral code' } };
            }
  

      const students = await this.prisma.user_Details.findMany({
        where: { referral_code: teacher.referral_code, user_status: '1' },
      });
      return { statusCode: 200, message: { activeStudents: students } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCountAndSubscriptionsOfStudentUsingTeacherReferral(teacherId: string): Promise<StatsResponse> {
    try {
      const teacher = await this.prisma.user_Details.findUnique({
        where: { id: teacherId },
        select: { referral_code: true },
      });

      if (!teacher) return { statusCode: 200, message: { description: 'Teacher not found' } };

      const [studentCount, students] = await Promise.all([
        this.prisma.user_Details.count({
          where: { referral_code: teacher.referral_code, user_status: '1' },
        }),
        this.prisma.user_Details.findMany({
          where: { referral_code: teacher.referral_code, user_status: '1' },
          include: { subscriptions: true },
        }),
      ]);

      return {
        statusCode: 200,
        message: {
          studentCount,
          students: students.map((s) => ({ ...s, subscriptions: s.subscriptions })),
        },
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
