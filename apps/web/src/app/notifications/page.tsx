import { redirect } from "next/navigation";
import { Badge, Card } from "@localimpact/ui";

import { container } from "@/container";
import { NotificationList } from "@/features/notifications/notification-list";
import { getAuthenticatedUser } from "@/lib/auth-session";

export default async function NotificationsPage() {
  const user = await getAuthenticatedUser();
  if (user === null) {
    redirect("/login");
  }

  const feed = await container.getNotificationsForUser.execute({ userId: user.id });

  return (
    <section aria-labelledby="notifications-title" className="mx-auto max-w-3xl space-y-4">
      <div>
        <Badge className="mb-2" variant="info">Activité</Badge>
        <h1 className="text-3xl font-black text-slate-950" id="notifications-title">
          Notifications
        </h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {feed.unreadCount === 0
            ? "Vous êtes à jour."
            : `${feed.unreadCount} notification${feed.unreadCount === 1 ? "" : "s"} non lue${feed.unreadCount === 1 ? "" : "s"}.`}
        </p>
      </div>
      <Card className="overflow-hidden border-2 border-slate-900">
        <NotificationList notifications={feed.notifications} />
      </Card>
    </section>
  );
}
