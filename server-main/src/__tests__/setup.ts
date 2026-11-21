/** @format */

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-jwt-secret-for-unit-tests-only";

process.env.NODE_ENV = "test";

// Mock Prisma Client
jest.mock("../lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    report: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    activity: {
      createMany: jest.fn(),
      create: jest.fn(),
    },
    upvote: {
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  },
}));

// Global test timeout
jest.setTimeout(10000);
