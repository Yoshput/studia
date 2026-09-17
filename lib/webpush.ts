import webpush from "web-push";
import { db } from "@/lib/db";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:yossikaerlangga@gmail.com";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error("Failed to initialize VAPID details:", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { user_id: userId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, message: "Tidak ada langganan push untuk pengguna ini" };
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/dashboard",
      icon: payload.icon || "/icons/icon-192.png",
      tag: payload.tag || "semestr-reminder",
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, payloadString);
        return { id: sub.id, success: true };
      } catch (error: any) {
        console.error(`Error sending push to subscription ${sub.id}:`, error?.statusCode || error);
        // If subscription is expired or revoked (404 or 410), clean it up
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          try {
            await db.pushSubscription.delete({ where: { id: sub.id } });
            console.log(`Removed stale subscription ${sub.id}`);
          } catch (delErr) {
            console.error(`Failed to remove stale subscription ${sub.id}:`, delErr);
          }
        }
        return { id: sub.id, success: false, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    return {
      success: successCount > 0,
      total: subscriptions.length,
      sent: successCount,
    };
  } catch (error) {
    console.error("sendPushToUser general error:", error);
    return { success: false, error };
  }
}
