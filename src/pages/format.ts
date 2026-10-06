const hours = new Intl.NumberFormat("en", {
  style: "unit",
  unit: "hour",
  unitDisplay: "narrow",
  maximumFractionDigits: 1,
});

/** 25 → "25 min", 90 → "1.5h", 240 → "4h". */
export function formatMinutes(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : hours.format(minutes / 60);
}
