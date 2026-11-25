export type {
  ActorContext,
  CategoryReportCount,
  CommentaireDto,
  CommentaireDetailDto,
  DashboardStatsDto,
  HistoriqueStatutDto,
  HistoriqueStatutDetailDto,
  NewUserRecord,
  PhotoUpload,
  SignalementDto,
  SignalementDetailDto,
  SignalementListItemDto,
  SignalementSearchQuery,
  SignalementsPageDto,
  UserDto,
  UserDisplayName,
  UserRecord,
  UserRole,
} from "./dto.js";
export {
  toCommentaireDto,
  toHistoriqueStatutDto,
  toSignalementDto,
  toUserDto,
} from "./dto.js";
export {
  ApplicationError,
  ApplicationValidationError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "./errors/application-error.js";
export type { ApplicationErrorCode } from "./errors/application-error.js";
export type { Clock } from "./ports/clock.js";
export type { CommentaireRepository } from "./ports/commentaire-repository.js";
export type {
  DuplicateSignalementDetector,
  DuplicateSignalementQuery,
} from "./ports/duplicate-signalement-detector.js";
export type { FileStorage } from "./ports/file-storage.js";
export type { HistoriqueRepository } from "./ports/historique-repository.js";
export type { IdGenerator } from "./ports/id-generator.js";
export type { PasswordHasher } from "./ports/password-hasher.js";
export type { SignalementRepository } from "./ports/signalement-repository.js";
export type { TransactionManager } from "./ports/transaction-manager.js";
export type { UserRepository } from "./ports/user-repository.js";
export { AddComment } from "./use-cases/add-comment.js";
export type { AddCommentInput } from "./use-cases/add-comment.js";
export { AssignResponsable } from "./use-cases/assign-responsable.js";
export type { AssignResponsableInput } from "./use-cases/assign-responsable.js";
export { AuthenticateUser } from "./use-cases/authenticate-user.js";
export type { AuthenticateUserInput } from "./use-cases/authenticate-user.js";
export { ChangeSignalementStatus } from "./use-cases/change-signalement-status.js";
export type {
  ChangeSignalementStatusInput,
  ChangeSignalementStatusOutput,
} from "./use-cases/change-signalement-status.js";
export { CreateSignalement } from "./use-cases/create-signalement.js";
export type { CreateSignalementInput } from "./use-cases/create-signalement.js";
export { GetDashboardStats } from "./use-cases/get-dashboard-stats.js";
export { GetSignalementById } from "./use-cases/get-signalement-by-id.js";
export type { GetSignalementByIdInput } from "./use-cases/get-signalement-by-id.js";
export { GetSignalementDetail } from "./use-cases/get-signalement-detail.js";
export type { GetSignalementDetailInput } from "./use-cases/get-signalement-detail.js";
export { GetSignalements } from "./use-cases/get-signalements.js";
export type { GetSignalementsInput } from "./use-cases/get-signalements.js";
export { RegisterUser } from "./use-cases/register-user.js";
export type { RegisterUserInput } from "./use-cases/register-user.js";
export { SupportSignalement } from "./use-cases/support-signalement.js";
export type {
  SupportSignalementInput,
  SupportSignalementOutput,
} from "./use-cases/support-signalement.js";
