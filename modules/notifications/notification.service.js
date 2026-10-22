import { prisma } from "../../lib/prisma";

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item
  ));
}

export async function listUserNotifications(userId) {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_date: "desc" },
    take: 30,
  });
  return serialize(notifications);
}

export async function markUserNotificationsRead(userId, notificationId) {
  let id;
  if (notificationId !== undefined && notificationId !== null && notificationId !== "") {
    if (typeof notificationId !== "string" || !/^\d+$/.test(notificationId)) {
      return { error: "Invalid notification." };
    }
    id = BigInt(notificationId);
  }

  await prisma.notification.updateMany({
    where: { user_id: userId, ...(id ? { notification_id: id } : {}) },
    data: { is_read: true },
  });
  return {};
}
