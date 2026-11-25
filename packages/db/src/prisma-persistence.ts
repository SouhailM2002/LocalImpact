import type {
  Clock,
  CommentaireRepository,
  HistoriqueRepository,
  NotificationRepository,
  SignalementRepository,
  TransactionManager,
  UserRepository,
} from "@localimpact/application";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "./client.js";
import { PrismaCommentaireRepository } from "./repositories/prisma-commentaire-repository.js";
import { PrismaHistoriqueRepository } from "./repositories/prisma-historique-repository.js";
import { PrismaNotificationRepository } from "./repositories/prisma-notification-repository.js";
import { PrismaSignalementRepository } from "./repositories/prisma-signalement-repository.js";
import { PrismaUserRepository } from "./repositories/prisma-user-repository.js";
import { PrismaTransactionManager } from "./prisma-transaction-context.js";

export interface PrismaPersistence {
  readonly signalements: SignalementRepository;
  readonly users: UserRepository;
  readonly commentaires: CommentaireRepository;
  readonly historiques: HistoriqueRepository;
  readonly notifications: NotificationRepository;
  readonly transactions: TransactionManager;
}

export function createPrismaPersistence(
  clock: Clock,
  client: PrismaClient = prisma,
): PrismaPersistence {
  return Object.freeze({
    signalements: new PrismaSignalementRepository(client, clock),
    users: new PrismaUserRepository(client),
    commentaires: new PrismaCommentaireRepository(client),
    historiques: new PrismaHistoriqueRepository(client),
    notifications: new PrismaNotificationRepository(client),
    transactions: new PrismaTransactionManager(client),
  });
}
