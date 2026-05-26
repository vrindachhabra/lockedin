export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function toInputDate(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

export function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export function isOverdue(value: string) {
  const date = new Date(value);
  const now = new Date();
  date.setHours(23, 59, 59, 999);
  return date < now;
}

export function daysUntil(value: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(value);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}
