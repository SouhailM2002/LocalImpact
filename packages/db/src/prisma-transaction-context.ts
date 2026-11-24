import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { TransactionManager } from "@localimpact/application";

const transactionContext = new AsyncLocalStorage<Prisma.TransactionClient>();

export function getPrismaExecutor(prisma: PrismaClient): Prisma.TransactionClient {
  return transactionContext.getStore() ?? prisma;
}

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  run<T>(operation: () => Promise<T>): Promise<T> {
    const activeTransaction = transactionContext.getStore();
    if (activeTransaction !== undefined) {
      return operation();
    }

    return this.prisma.$transaction((transaction) =>
      transactionContext.run(transaction, operation),
    );
  }
}
