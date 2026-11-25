"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NotificationNotFoundError } from "@localimpact/application";
import { container } from "@/container";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function openNotificationAction(formData: FormData): Promise<void> {
  const user = await getAuthenticatedUser();
  if (user === null) {
    redirect("/login");
  }

  const notificationId = formData.get("notificationId");
  if (
    typeof notificationId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(notificationId)
  ) {
    redirect("/notifications");
  }

  let signalementId: string;
  try {
    signalementId = await container.markNotificationAsRead.execute({
      notificationId,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof NotificationNotFoundError) {
      redirect("/notifications");
    }
    throw error;
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  redirect(`/reports/${encodeURIComponent(signalementId)}`);
}
