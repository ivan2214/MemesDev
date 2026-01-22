"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { notificationTable, user } from "@/db/schemas";
import { sendEmail } from "@/lib/send-email";
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
  // Crear la notificación en la base de datos
  await db.insert(notificationTable).values({
    userId,
    type,
    message,
    link,
    read: false,
    from,
  });

  // Obtener el email del usuario para enviar la notificación
  const targetUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { email: true, name: true },
  });

  if (targetUser?.email) {
    // Enviar email de notificación (no bloqueante)
    sendEmail({
      type: "notification",
      to: targetUser.email,
      userFirstname: targetUser.name ?? undefined,
      notificationType: type,
      message,
      link,
    }).catch((error) => {
      // Log del error pero no bloquear la creación de la notificación
      console.error("Error enviando email de notificación:", error);
    });
  }

  // Revalidar para que se actualicen las notificaciones en la UI
  revalidatePath("/");
};
