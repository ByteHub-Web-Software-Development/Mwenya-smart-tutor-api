import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) { }

  async initiatePayment(dto: InitiatePaymentDto) {
    // 1. Check user existence
    const user = await this.prisma.user_Details.findUnique({
      where: { id: dto.user_id }
    });

    if (!user) throw new NotFoundException(`User ${dto.user_id} not found`);

    // 2. Mock transaction ID (Replace with actual MNO logic later)
    const transId = `TXN-${Date.now()}-${dto.user_id.slice(-6)}`;

    // LOG: Track initiation for debugging
    this.logger.log(`Payment initiated for user ${dto.user_id} - TXN: ${transId}`);

    // Return just the data. The Controller/Scalar will handle the status code.
    return {
      description: 'Payment initiation stub — MNO integration pending',
      trans_id: transId,
      amount: dto.amount,
      period: dto.period,
      msisdn: dto.msisdn,
    };
  }

  async getPaymentStatus(transId: string) {
    const receipt = await this.prisma.receipts.findFirst({
      where: { trans_id: transId },
    });

    if (!receipt) throw new NotFoundException(`Transaction ${transId} not found`);

    return receipt;
  }

  async getReceipts(userId: string) {
    // Simplify: Prisma handles the empty array case naturally
    return this.prisma.receipts.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createReceipt(dto: CreateReceiptDto) {
    const user = await this.prisma.user_Details.findUnique({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundException(`User ${dto.user_id} not found`);

    return await this.prisma.receipts.create({
      data: {
        trans_id: dto.trans_id,
        amount: dto.amount,
        period: dto.period,
        user_id: dto.user_id,
        created_at: new Date(), 
        updated_at: new Date(), 
      },
    });
  }
}