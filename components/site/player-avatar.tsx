'use client'

import type { PlayerItem } from '@/lib/types'

export function PlayerAvatar({ player }: { player: { name: string; portrait?: string; country?: string; id?: string; playerId?: string } }) {
  if (player.portrait && player.portrait.trim().length > 0) {
    return (
      <img
        src={player.portrait}
        alt={`${player.name} portrait`}
        style={{ width: '220px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 14px 40px rgba(0,0,0,.18)' }}
      />
    )
  }
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const countryColors: Record<string, string> = {
    KR: '#c5202d', JP: '#171717', CN: '#cf0a2d', US: '#002868', CA: '#cf0a2d',
    UK: '#012169', FR: '#0055a4', DE: '#171717', AU: '#171717', SG: '#cf0a2d',
    TW: '#171717', HK: '#cf0a2d', TH: '#171717', VN: '#cf0a2d', PH: '#171717',
  }
  const bg = countryColors[player.country || ''] || '#555'
  return (
    <div
      style={{
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${bg}, #171717)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: 'bold 64px Georgia, serif',
        letterSpacing: '-0.06em',
        boxShadow: '0 14px 40px rgba(0,0,0,.18)',
      }}
      aria-label={`${player.name} avatar`}
    >
      {initials || (player.id || player.playerId || '').slice(0, 2).toUpperCase()}
    </div>
  )
}
