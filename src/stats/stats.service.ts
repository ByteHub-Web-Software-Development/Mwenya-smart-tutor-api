import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { StatsResponse } from '../types/stat-types';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAppUsers(): Promise<StatsResponse> {
    const users = await this.prisma.user_Details.findMany({
      where: { user_role: '1' },
      select: { id: true, created_at: true, device_id: true, msisdn: true, updated_at: true, user_name: true },
    });
    return { statusCode: 200, message: { description: 'UnSubscribed users', unsubcribed_users: users } };
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


  async getUserData(): Promise<StatsResponse> {
    const userData = await this.prisma.user_Details.findMany({
      include: { subscriptions: true },
    });
    return { statusCode: 200, message: { userData } };
  }


  async getWeeklySubscriptions(): Promise<StatsResponse> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const subscriptions = await this.prisma.subscriptions.findMany({
        where: { created_at: { gte: weekAgo } },
      });
      return { statusCode: 200, message: { weeklySubscriptions: subscriptions } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getWeeklyAppUsers(): Promise<StatsResponse> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const users = await this.prisma.user_Details.findMany({
        where: { created_at: { gte: weekAgo } },
      });
      return { statusCode: 200, message: { weeklyUsers: users } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDailyNewUser(): Promise<StatsResponse> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [newUsers, newSubscriptions, referralsUsed] = await Promise.all([
        this.prisma.user_Details.count({ where: { created_at: { gte: today } } }),
        this.prisma.subscriptions.count({ where: { created_at: { gte: today } } }),
        this.prisma.user_Details.count({
          where: { referral_code: { not: null }, created_at: { gte: today } },
        }),
      ]);

      return { statusCode: 200, message: { newUsers, newSubscriptions, referralsUsed } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTeacherReferralSubscriptions(): Promise<StatsResponse> {
    try {
      const teachers = await this.prisma.user_Details.findMany({
        where: { user_role: '2' },
        select: {
          msisdn: true,
          referral_code: true,
          subscriptions: {
            where: { OR: [{ subscription_type: 'monthly' }, { subscription_type: 'termly' }] },
            select: { subscription_type: true, commission: true },
          },
        },
      });
      return { statusCode: 200, message: { teacherReferrals: teachers } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAdminReferralSubscriptions(): Promise<StatsResponse> {
    try {
      const adminReferrals = await this.prisma.user_Details.findMany({
        where: { user_role: '3' },
        include: { subscriptions: true },
      });
      return { statusCode: 200, message: { adminReferrals } };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAdminTotalStats(): Promise<StatsResponse> {
    try {
      const [totalUsers, activeUsers, inactiveUsers, teachers, totalSales] = await Promise.all([
        this.prisma.user_Details.count(),
        this.prisma.user_Details.count({ where: { user_status: '1' } }),
        this.prisma.user_Details.count({ where: { user_status: '0' } }),
        this.prisma.user_Details.count({ where: { user_role: '2' } }),
        this.prisma.subscriptions.aggregate({ _sum: { amount: true } }),
      ]);

      return {
        statusCode: 200,
        message: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          teachers,
          totalSales: totalSales._sum.amount ?? 0,
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

  /** Fixed B-10: Now accepts managerId to scope the referral count */
  async getCountOfReferralsUnderSalesManager(managerId: string): Promise<StatsResponse> {
    try {
      // Count users who used a referral code belonging to a teacher under this manager
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

      if (!teacher) return { statusCode: 200, message: { description: 'Teacher not found' } };

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

      const students = await this.prisma.user_Details.findMany({
        where: { referral_code: teacher.referral_code },
        include: { subscriptions: true },
      });

      return {
        statusCode: 200,
        message: {
          studentCount: students.length,
          students: students.map((s) => ({ ...s, subscriptions: s.subscriptions })),
        },
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
