/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto} from './dto/initiate-payment.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Validation failed.' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid token.' })
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('initiate')
@ApiOperation({
    summary: 'Initiate a payment',
    description: 'Future: MTN/Airtel Zambia mobile money integration. Currently logs transaction for subscription activation. Returns transaction ID.',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment initiated — returns transaction ID.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
  }

  @Get('status/:transId')
@ApiOperation({ 
    summary: 'Get payment status', 
    description: 'Future: Real-time mobile money status check. Currently returns logged transaction status.' 
  })
  @ApiParam({ name: 'transId', description: 'Transaction ID from payment provider' })
  @ApiResponse({ status: 200, description: 'Payment status.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async getPaymentStatus(@Param('transId') transId: string) {
    return this.paymentService.getPaymentStatus(transId);
  }

  @Get('receipts/:userId')
@ApiOperation({ 
    summary: 'Get user payment receipts', 
    description: 'Returns logged payment receipts for user (future: mobile money receipts).' 
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of receipts.' })
  async getReceipts(@Param('userId') userId: string) {
    return this.paymentService.getReceipts(userId);
  }

  @Post('receipt')
@ApiOperation({ 
    summary: 'Create a payment receipt', 
    description: 'Future: Auto from mobile money webhook. Currently manual receipt logging.' 
  })
  @ApiBody({ type: CreateReceiptDto })
  @ApiResponse({ status: 201, description: 'Receipt created.' })
  async createReceipt(@Body() dto: CreateReceiptDto) {
    return this.paymentService.createReceipt(dto);
  }
}


