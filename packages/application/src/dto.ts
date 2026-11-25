import type { Commentaire } from "@localimpact/domain";
import type { HistoriqueStatut } from "@localimpact/domain";
import type { Signalement } from "@localimpact/domain";
import type { SignalementActorRole } from "@localimpact/domain";
import type {
  AccessibilityBarrierType,
  AccessibilityImpact,
  AccessibilityUrgency,
  StatutValue,
} from "@localimpact/domain";

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
  readonly accessibilityOnly?: boolean;
  readonly accessibilityImpact?: AccessibilityImpact;
  readonly accessibilityUrgency?: AccessibilityUrgency;
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
  readonly latitude?: number;
  readonly longitude?: number;
  readonly accessibilityBarrierType?: AccessibilityBarrierType;
  readonly accessibilityImpact?: AccessibilityImpact;
  readonly accessibilityUrgency?: AccessibilityUrgency;
  readonly photoUrl: string | undefined;
  readonly createdAt: Date;
  readonly creatorId: string;
  readonly assignedResponsableId: string | undefined;
  readonly status: StatutValue;
  readonly supportCount: number;
}

export interface SignalementListItemDto extends SignalementDto {
  readonly creatorDisplayName: string | null;
}

export interface SignalementsPageDto {
  readonly reports: readonly SignalementListItemDto[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
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

export interface CommentaireDetailDto extends CommentaireDto {
  readonly authorDisplayName: string | null;
}

export interface HistoriqueStatutDetailDto extends HistoriqueStatutDto {
  readonly authorDisplayName: string | null;
}

export interface SignalementDetailDto {
  readonly report: SignalementDto & {
    readonly creatorDisplayName: string | null;
    readonly assignedResponsableDisplayName: string | null;
  };
  readonly viewerHasSupported: boolean;
  readonly statusHistory: readonly HistoriqueStatutDetailDto[];
  readonly comments: readonly CommentaireDetailDto[];
}

export type NotificationType = "REPORT_SUPPORTED";

export interface NotificationDto {
  readonly id: string;
  readonly type: NotificationType;
  readonly signalementId: string;
  readonly signalementTitle: string;
  readonly createdAt: Date;
  readonly readAt: Date | undefined;
}

export interface NewNotificationRecord extends Omit<NotificationDto, "readAt"> {
  readonly recipientId: string;
}

export interface NotificationFeedDto {
  readonly notifications: readonly NotificationDto[];
  readonly unreadCount: number;
}

export interface UserRecord {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly passwordHash: string | null;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export type NewUserRecord = Omit<UserRecord, "passwordHash"> & {
  readonly passwordHash: string;
};

export interface UserDto {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export interface AdminUserSummaryDto {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface UserDisplayName {
  readonly id: string;
  readonly displayName: string;
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
    ...(signalement.latitude === undefined ? {} : { latitude: signalement.latitude }),
    ...(signalement.longitude === undefined ? {} : { longitude: signalement.longitude }),
    ...(signalement.accessibilityBarrierType === undefined
      ? {}
      : { accessibilityBarrierType: signalement.accessibilityBarrierType }),
    ...(signalement.accessibilityImpact === undefined
      ? {}
      : { accessibilityImpact: signalement.accessibilityImpact }),
    ...(signalement.accessibilityUrgency === undefined
      ? {}
      : { accessibilityUrgency: signalement.accessibilityUrgency }),
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
