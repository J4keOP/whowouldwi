export function formatDuration(totalSeconds: number, compact = false): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "unknown";
  if (totalSeconds < 0.01) return `${(totalSeconds * 1000).toFixed(2)} ms`;
  if (totalSeconds < 1) return `${(totalSeconds * 1000).toFixed(0)} ms`;

  const units = [
    { label: compact ? "y" : "year", seconds: 31_557_600 },
    { label: compact ? "d" : "day", seconds: 86_400 },
    { label: compact ? "h" : "hour", seconds: 3_600 },
    { label: compact ? "m" : "minute", seconds: 60 },
    { label: compact ? "s" : "second", seconds: 1 },
  ];

  let remaining = Math.round(totalSeconds);
  const parts: string[] = [];
  for (const unit of units) {
    if (remaining < unit.seconds) continue;
    const value = Math.floor(remaining / unit.seconds);
    remaining %= unit.seconds;
    parts.push(compact ? `${value}${unit.label}` : `${value} ${unit.label}${value === 1 ? "" : "s"}`);
    if (parts.length >= 2) break;
  }
  return parts.length > 0 ? parts.join(compact ? " " : ", ") : "0 seconds";
}
