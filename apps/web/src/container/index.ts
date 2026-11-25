import "server-only";

import { randomUUID } from "node:crypto";
import {
  AddComment,
  AssignResponsable,
  AuthenticateUser,
  ChangeSignalementStatus,
  ChangeUserRole,
  CreateSignalement,
  GetDashboardStats,
  GetNotificationsForUser,
  GetResponsables,
  GetUsersForAdmin,
  GetSignalementById,
  GetSignalementDetail,
  GetSignalements,
  RegisterUser,
  MarkNotificationAsRead,
  SupportSignalement,
} from "@localimpact/application";
import type { Clock, IdGenerator } from "@localimpact/application";
import { createPrismaPersistence } from "@localimpact/db";
import {
  LocalFileStorage,
  ScryptPasswordHasher,
  SignalementDuplicateDetector,
} from "@localimpact/infra";

const clock: Clock = {
  now: () => new Date(),
};

const ids: IdGenerator = {
  next: randomUUID,
};

const persistence = createPrismaPersistence(clock);
const fileStorage = new LocalFileStorage();
const duplicateDetector = new SignalementDuplicateDetector(persistence.signalements);
const passwordHasher = new ScryptPasswordHasher();
const getSignalementById = new GetSignalementById(persistence.signalements);

export const container = Object.freeze({
  createSignalement: new CreateSignalement(
    persistence.signalements,
    fileStorage,
    clock,
    ids,
    duplicateDetector,
  ),
  getSignalements: new GetSignalements(
    persistence.signalements,
    persistence.users,
  ),
  getSignalementById,
  getSignalementDetail: new GetSignalementDetail(
    getSignalementById,
    persistence.commentaires,
    persistence.historiques,
    persistence.users,
    persistence.signalements,
  ),
  supportSignalement: new SupportSignalement(
    persistence.signalements,
    persistence.notifications,
    clock,
    ids,
    persistence.transactions,
  ),
  getNotificationsForUser: new GetNotificationsForUser(persistence.notifications),
  markNotificationAsRead: new MarkNotificationAsRead(persistence.notifications, clock),
  assignResponsable: new AssignResponsable(
    persistence.signalements,
    persistence.users,
  ),
  changeSignalementStatus: new ChangeSignalementStatus(
    persistence.signalements,
    persistence.historiques,
    clock,
    ids,
    persistence.transactions,
  ),
  addComment: new AddComment(
    persistence.signalements,
    persistence.commentaires,
    clock,
    ids,
  ),
  getDashboardStats: new GetDashboardStats(persistence.signalements),
  getResponsables: new GetResponsables(persistence.users),
  getUsersForAdmin: new GetUsersForAdmin(persistence.users),
  changeUserRole: new ChangeUserRole(persistence.users),
  registerUser: new RegisterUser(
    persistence.users,
    passwordHasher,
    clock,
    ids,
  ),
  authenticateUser: new AuthenticateUser(
    persistence.users,
    passwordHasher,
  ),
});
