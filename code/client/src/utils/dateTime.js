const APP_TIME_ZONE = "Asia/Colombo";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: APP_TIME_ZONE,
});

export function formatAppDateTime(value) {
  const date = parseDatabaseDate(value);
  return date ? DATE_TIME_FORMATTER.format(date) : "-";
}

export function formatAppDate(value) {
  const date = parseDatabaseDate(value);
  return date ? DATE_FORMATTER.format(date) : "-";
}

function parseDatabaseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const timestamp = String(value);
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(timestamp);
  const normalizedTimestamp = hasTimezone ? timestamp : `${timestamp}Z`;
  const date = new Date(normalizedTimestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}
