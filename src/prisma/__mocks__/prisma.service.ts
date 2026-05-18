// Jest manual mock for PrismaService
// This file is used when tests call `jest.mock('../prisma/prisma.service')`.

const mockFn = <T extends (...args: any[]) => any>(impl?: T): jest.Mock => {
  return jest.fn(impl as any);
};

const prismaServiceMock = {
  user_Details: {
    findFirst: mockFn(),
  },
  sessions: {
    findFirst: mockFn(),
    upsert: mockFn(),
    count: mockFn(),
    deleteMany: mockFn(),
  },
  deletion_Requests: {
    findFirst: mockFn(),
    create: mockFn(),
  },
  oTP: {
    deleteMany: mockFn(),
  },
  receipts: {
    deleteMany: mockFn(),
  },
  subscriptions: {
    deleteMany: mockFn(),
  },
  $transaction: mockFn(),

  $connect: mockFn(),
};

class PrismaService {

  user_Details = prismaServiceMock.user_Details;
  sessions = prismaServiceMock.sessions;
  deletion_Requests = prismaServiceMock.deletion_Requests;
  oTP = prismaServiceMock.oTP;
  receipts = prismaServiceMock.receipts;
  subscriptions = prismaServiceMock.subscriptions;
  $transaction = prismaServiceMock.$transaction;

  $connect = prismaServiceMock.$connect;
}


// Expose the underlying mock object so tests can set return values if they want.
export const __prismaServiceMock = prismaServiceMock;

