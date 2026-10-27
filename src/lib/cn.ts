/**
 * Joins class names, skipping falsey values.
 * Used instead of extra className libraries.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
