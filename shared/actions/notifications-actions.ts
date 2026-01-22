"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { notificationTable } from "@/db/schemas";
import type { NotificationType } from "../types";

export const getNotifications = cache(async (userId: string) => {
  const notifications = await db.query.notificationTable.findMany({
    where: eq(notificationTable.userId, userId),
    orderBy: desc(notificationTable.createdAt),
  });

  return notifications;
});

export const markNotificationAsRead = async (notificationId: string) => {
  const notification = await db.query.notificationTable.findFirst({
    where: eq(notificationTable.id, notificationId),
  });

  if (!notification) {
    return {
      success: false,
      message: "Notificacion no encontrada",
    };
  }

  const result = await db
    .update(notificationTable)
    .set({ read: true })
    .where(eq(notificationTable.id, notificationId));

  if (result.rowCount === 0) {
    return {
      success: false,
      message: "Algo salio mal",
    };
  }
  revalidatePath("/");

  return {
    success: true,
    message: "Notificacion marcada como leida",
  };
};

export const createNotification = async (
  userId: string,
  type: NotificationType,
  message: string,
  link: string,
  from: string,
) => {
  await db.insert(notificationTable).values({
    userId,
    type,
    message,
    link,
    read: false,
    from,
  });
};
