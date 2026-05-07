/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('Subscription')
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Validation failed.' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid token.' })
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans', description: 'Returns all available subscription plan options.' })
  @ApiResponse({ status: 200, description: 'List of subscription plans.' })
  async getAllPlans() {
    return this.subscriptionService.getAllSubscriptionPlans();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user subscriptions', description: 'Returns all subscription records for a given user.' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User subscriptions.' })
  async getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @Get('active/:userId')
  @ApiOperation({ summary: 'Check active subscription', description: 'Returns the most recent valid subscription for a user.' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Active subscription found.' })
  @ApiResponse({ status: 404, description: 'No active subscription.' })
  async getActiveSubscription(@Param('userId') userId: string) {
    return this.subscriptionService.getActiveSubscription(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription record', description: 'Records a new subscription after payment is confirmed.' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription created.' })
  @ApiResponse({ status: 404, description: 'User or subscription plan not found.' })
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a subscription', description: 'Cancels (soft-deletes) a subscription record.' })
  @ApiParam({ name: 'id', description: 'Subscription ID to cancel' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled.' })
  async cancelSubscription(@Param('id') id: string) {
    return this.subscriptionService.cancelSubscription(id);
  }
}
