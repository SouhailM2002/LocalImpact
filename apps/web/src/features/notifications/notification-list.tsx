import Link from "next/link";
import type { NotificationDto } from "@localimpact/application";
import { openNotificationAction } from "@/app/notifications/actions";

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function NotificationContent({ notification }: { readonly notification: NotificationDto }) {
  return (
    <span className="block">
      <span className="block text-sm font-semibold text-slate-900">
        Votre signalement a reçu un nouveau soutien.
      </span>
      <span className="mt-1 block truncate text-sm text-slate-700">
        {notification.signalementTitle}
      </span>
      <time
        className="mt-1 block text-xs text-slate-500"
        dateTime={notification.createdAt.toISOString()}
      >
        {formatDateTime(notification.createdAt)}
      </time>
    </span>
  );
}

export function NotificationList({
  notifications,
}: {
  readonly notifications: readonly NotificationDto[];
}) {
  if (notifications.length === 0) {
    return (
      <p className="py-4 text-sm leading-6 text-slate-600">
        Vous n’avez pas encore de notification.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200">
      {notifications.map((notification) => (
        <li key={notification.id}>
          {notification.readAt === undefined ? (
            <form action={openNotificationAction}>
              <input name="notificationId" type="hidden" value={notification.id} />
              <button
                className="w-full px-3 py-3 text-left hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1F4FD8]"
                type="submit"
              >
                <NotificationContent notification={notification} />
              </button>
            </form>
          ) : (
            <Link
              className="block px-3 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1F4FD8]"
              href={`/reports/${encodeURIComponent(notification.signalementId)}`}
            >
              <NotificationContent notification={notification} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
