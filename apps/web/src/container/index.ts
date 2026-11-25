import "server-only";

import { randomUUID } from "node:crypto";
import {
  AddComment,
  AssignResponsable,
  AuthenticateUser,
  ChangeSignalementStatus,
  CreateSignalement,
  GetDashboardStats,
  GetSignalementById,
  GetSignalementDetail,
  GetSignalements,
  RegisterUser,
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
  ),
  supportSignalement: new SupportSignalement(persistence.signalements),
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
