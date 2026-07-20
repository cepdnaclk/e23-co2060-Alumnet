export const APP_TIME_ZONE = "Asia/Colombo";

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

const EVENT_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

export function getEventDateValue(value) {
  if (!value) return "";
  const text = String(value);
  if (!text.includes("T")) return text.slice(0, 10);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(text));
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatEventDate(value) {
  const dateValue = getEventDateValue(value);
  if (!dateValue) return "-";
  return EVENT_DATE_FORMATTER.format(new Date(`${dateValue}T12:00:00Z`));
}

export function formatEventTime(value) {
  if (!value) return "-";
  const [hours = "0", minutes = "0"] = String(value).split(":");
  const date = new Date(Date.UTC(2000, 0, 1, Number(hours), Number(minutes)));
  return date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function isEventDayPast(event) {
  if (typeof event?.is_past === "boolean") return event.is_past;
  const dateValue = getEventDateValue(event?.event_date);
  if (!dateValue) return false;
  if (event?.ending_time) {
    const endingTime = String(event.ending_time).slice(0, 8);
    const endDateTime = new Date(`${dateValue}T${endingTime}+05:30`);
    return !Number.isNaN(endDateTime.getTime()) && endDateTime.getTime() <= Date.now();
  }
  const endOfDay = new Date(`${dateValue}T23:59:59.999+05:30`);
  return !Number.isNaN(endOfDay.getTime()) && endOfDay.getTime() < Date.now();
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
