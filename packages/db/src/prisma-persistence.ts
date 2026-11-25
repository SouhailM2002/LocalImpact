import type {
  Clock,
  CommentaireRepository,
  HistoriqueRepository,
  NotificationRepository,
  SignalementRepository,
  TransactionManager,
  UserRepository,
} from "@localimpact/application";
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

export function createPrismaPersistence(clock: Clock): PrismaPersistence {
  return Object.freeze({
    signalements: new PrismaSignalementRepository(prisma, clock),
    users: new PrismaUserRepository(prisma),
    commentaires: new PrismaCommentaireRepository(prisma),
    historiques: new PrismaHistoriqueRepository(prisma),
    notifications: new PrismaNotificationRepository(prisma),
    transactions: new PrismaTransactionManager(prisma),
  });
}
