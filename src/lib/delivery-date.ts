/**
 * Next-day delivery date calculation.
 * Cut-off: 6 PM UK time. No Sunday deliveries.
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

  // Before 6 PM → next day; after 6 PM → day after next
  const daysToAdd = hour < 18 ? 1 : 2;

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
