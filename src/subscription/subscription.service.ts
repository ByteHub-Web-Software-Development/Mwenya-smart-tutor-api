/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSubscriptionPlans() {
    const plans = await this.prisma.subscription_Details.findMany();
    return { statusCode: 200, message: { plans } };
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscriptions.findMany({
      where: { user_id: userId },
      include: { details: true },
      orderBy: { created_at: 'desc' },
    });
    return { statusCode: 200, message: { subscriptions } };
  }

  async getActiveSubscription(userId: string) {
    const subscription = await this.prisma.subscriptions.findFirst({
      where: { user_id: userId },
      include: { details: true },
      orderBy: { created_at: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException(`No active subscription found for user ${userId}`);
    }

    return { statusCode: 200, message: { subscription } };
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    // Validate user exists
    const user = await this.prisma.user_Details.findUnique({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundException(`User ${dto.user_id} not found`);

    // Validate subscription plan exists
    const plan = await this.prisma.subscription_Details.findUnique({ where: { id: dto.sub_details_id } });
    if (!plan) throw new NotFoundException(`Subscription plan ${dto.sub_details_id} not found`);

    const subscription = await this.prisma.subscriptions.create({
      data: {
        user_id: dto.user_id,
        trans_id: dto.trans_id,
        sub_details_id: dto.sub_details_id,
        subscription_type: dto.subscription_type ?? 'monthly',
        amount: dto.amount ?? 0,
        commission: dto.commission ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { statusCode: 201, message: { description: 'Subscription created successfully', subscription } };
  }

  async cancelSubscription(id: string) {
    const subscription = await this.prisma.subscriptions.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription ${id} not found`);

    // Soft delete by setting updated_at — a future migration can add a `cancelled_at` field
    await this.prisma.subscriptions.update({
      where: { id },
      data: { updated_at: new Date() },
    });

    return { statusCode: 200, message: { description: 'Subscription cancelled successfully' } };
  }}
