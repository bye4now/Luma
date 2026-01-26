// utils/notifications.ts
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const DAILY_REMINDER_ID_KEY = "DAILY_REMINDER_ID";

// Show notifications even when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();

  if (existing.granted) return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.granted === true;
}

export async function scheduleDailyReminder8am() {
  const granted = await requestNotificationPermission();
  if (!granted) return { ok: false as const, reason: "permission_denied" as const };

  // Cancel any previous reminder we scheduled (simple “reset” behavior)
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    // We don't have our own tags here, so we just cancel everything that matches our title
    // (Keeps it simple for now; we can make it more precise later)
    if (n?.content?.title === "LUMA Journal Reminder") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Android needs a channel for sound/importance
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminders", {
      name: "Daily Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "LUMA Journal Reminder",
      body: "Take 2 minutes to journal how you feel today ✨",
      sound: "default",
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
      channelId: Platform.OS === "android" ? "daily-reminders" : undefined,
    } as any,
  });

  return { ok: true as const, id };
}

export async function cancelDailyReminder() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n?.content?.title === "LUMA Journal Reminder") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
