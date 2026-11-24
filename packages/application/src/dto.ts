import type { Commentaire } from "@localimpact/domain";
import type { HistoriqueStatut } from "@localimpact/domain";
import type { Signalement } from "@localimpact/domain";
import type { SignalementActorRole } from "@localimpact/domain";
import type { StatutValue } from "@localimpact/domain";

export type UserRole = SignalementActorRole;

export interface ActorContext {
  readonly userId: string;
  readonly role: UserRole;
}

export interface PhotoUpload {
  readonly fileName: string;
  readonly contentType: string;
  readonly content: Uint8Array;
}

export interface SignalementSearchQuery {
  readonly keyword?: string;
  readonly category?: string;
  readonly location?: string;
  readonly status?: StatutValue;
  readonly assignedResponsableId?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface SignalementDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
  readonly photoUrl: string | undefined;
  readonly createdAt: Date;
  readonly creatorId: string;
  readonly assignedResponsableId: string | undefined;
  readonly status: StatutValue;
  readonly supportCount: number;
}

export interface CommentaireDto {
  readonly id: string;
  readonly signalementId: string;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: Date;
}

export interface HistoriqueStatutDto {
  readonly id: string;
  readonly signalementId: string;
  readonly previousStatus: StatutValue;
  readonly newStatus: StatutValue;
  readonly authorId: string;
  readonly changedAt: Date;
  readonly interventionDescription: string | undefined;
}

export interface UserRecord {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export type NewUserRecord = UserRecord;

export interface UserDto {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export interface CategoryReportCount {
  readonly category: string;
  readonly count: number;
}

export interface DashboardStatsDto {
  readonly countsByStatus: Readonly<Record<StatutValue, number>>;
  readonly countsByCategory: readonly CategoryReportCount[];
  readonly averageResolutionTimeMs: number | null;
}

export function toSignalementDto(signalement: Signalement): SignalementDto {
  return {
    id: signalement.id.value,
    title: signalement.title,
    description: signalement.description,
    category: signalement.category,
    location: signalement.location,
    photoUrl: signalement.photoUrl,
    createdAt: signalement.createdAt,
    creatorId: signalement.creatorId,
    assignedResponsableId: signalement.assignedResponsableId,
    status: signalement.status.value,
    supportCount: signalement.supportCount,
  };
}

export function toCommentaireDto(commentaire: Commentaire): CommentaireDto {
  return {
    id: commentaire.id,
    signalementId: commentaire.signalementId.value,
    authorId: commentaire.authorId,
    content: commentaire.content,
    createdAt: commentaire.createdAt,
  };
}

export function toHistoriqueStatutDto(history: HistoriqueStatut): HistoriqueStatutDto {
  return {
    id: history.id,
    signalementId: history.signalementId.value,
    previousStatus: history.previousStatus.value,
    newStatus: history.newStatus.value,
    authorId: history.authorId,
    changedAt: history.changedAt,
    interventionDescription: history.interventionDescription,
  };
}

export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    createdAt: new Date(user.createdAt.getTime()),
  };
}
