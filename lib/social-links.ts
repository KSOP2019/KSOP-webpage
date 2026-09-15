export const SOCIAL_ORDER = ['FLOPIN', 'Instagram', 'X', 'Discord', 'Facebook', 'YouTube'] as const

export type SocialName = (typeof SOCIAL_ORDER)[number]
export type SocialLinks = Record<SocialName, string>

export const EMPTY_SOCIAL_LINKS: SocialLinks = {
  FLOPIN: '',
  Instagram: '',
  X: '',
  Discord: '',
  Facebook: '',
  YouTube: '',
}

export const SOCIAL_SYMBOLS: Record<SocialName, string> = {
  FLOPIN: 'F',
  Instagram: '◎',
  X: '𝕏',
  Discord: '◌',
  Facebook: 'f',
  YouTube: '▶',
}

export function normalizeSocialLinks(value: unknown): SocialLinks {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return SOCIAL_ORDER.reduce((result, name) => {
    const url = source[name]
    result[name] = typeof url === 'string' ? url.trim() : ''
    return result
  }, { ...EMPTY_SOCIAL_LINKS })
}
