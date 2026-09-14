/**
 * Canonical tournament event names — proper nouns, NEVER translated.
 * Render `{event.name}` directly. Never `t('events.main.name')`.
 * These names must NOT exist as translation keys in locales/*.json.
 */
export const CANONICAL_EVENT_NAMES = [
  'MAIN EVENT',
  'HIGH ROLLER',
  'SUPER HIGH ROLLER',
  'MYSTERY BOUNTY',
  'KICK-OFF',
  'CLOSING EVENT',
] as const;

export type CanonicalEventName = (typeof CANONICAL_EVENT_NAMES)[number];

/** Game-type codes shown as-is (not translated). */
export const CANONICAL_GAME_TYPES = [
  'NLH',
  'PLO',
  'SATELLITE',
  'MAIN EVENT',
  'HIGH ROLLER',
] as const;

export function isCanonicalEventName(value: string): boolean {
  return (CANONICAL_EVENT_NAMES as readonly string[]).includes(value);
}
