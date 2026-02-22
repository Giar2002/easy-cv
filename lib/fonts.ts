export const FONT_OPTIONS = [
  {
    value: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    label: 'Segoe UI (Sans)',
  },
  {
    value: "Georgia, 'Times New Roman', serif",
    label: 'Georgia (Serif)',
  },
  {
    value: "'Trebuchet MS', Verdana, sans-serif",
    label: 'Trebuchet (Humanist)',
  },
  {
    value: "'Courier New', Consolas, monospace",
    label: 'Courier New (Monospace)',
  },
] as const;

export const DEFAULT_FONT_FAMILY = FONT_OPTIONS[0].value;

export function sanitizeFontFamily(value?: string): string {
  if (!value) return DEFAULT_FONT_FAMILY;
  return FONT_OPTIONS.some(option => option.value === value)
    ? value
    : DEFAULT_FONT_FAMILY;
}
