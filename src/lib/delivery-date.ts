/**
 * Next-day delivery date calculation.
 * Cut-off: 9 PM UK time. No Sunday deliveries.
 */

function getUKHour(): { hour: number; dayOfWeek: number } {
  const now = new Date();
  const ukTime = new Date(
    now.toLocaleString("en-GB", { timeZone: "Europe/London" })
  );
  return { hour: ukTime.getHours(), dayOfWeek: ukTime.getDay() };
}

export function getNextDeliveryDate(): Date {
  const now = new Date();
  const { hour } = getUKHour();

  // Before 9 PM → next day; after 9 PM → day after next
  const daysToAdd = hour < 21 ? 1 : 2;

  const delivery = new Date(now);
  delivery.setDate(delivery.getDate() + daysToAdd);

  // No Sunday delivery — push to Monday
  if (delivery.getDay() === 0) {
    delivery.setDate(delivery.getDate() + 1);
  }

  return delivery;
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
