import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let mockSubscriptionService: Partial<SubscriptionService>;

  beforeEach(() => {
    mockSubscriptionService = {};
    controller = new SubscriptionController(mockSubscriptionService as SubscriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
