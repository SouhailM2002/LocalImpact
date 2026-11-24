export { Commentaire } from "./entities/commentaire.js";
export type { CreateCommentaireInput } from "./entities/commentaire.js";
export { HistoriqueStatut } from "./entities/historique-statut.js";
export type { CreateHistoriqueStatutInput } from "./entities/historique-statut.js";
export { Signalement } from "./entities/signalement.js";
export type {
  ChangeSignalementStatusInput,
  CreateSignalementInput,
  ReconstituteSignalementInput,
} from "./entities/signalement.js";
export {
  DejaSoutenuError,
  DomainError,
  DomainValidationError,
  DescriptionInterventionRequiseError,
  DuplicateSupportError,
  InterventionRequiredError,
  InvalidSignalementError,
  InvalidStatusTransitionError,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "./errors/domain-error.js";
export type { DomainErrorCode } from "./errors/domain-error.js";
export { SignalementId } from "./value-objects/signalement-id.js";
export { STATUT_VALUES, Statut } from "./value-objects/statut.js";
export type { StatutValue } from "./value-objects/statut.js";
export type { SignalementActorRole } from "./entities/signalement.js";
