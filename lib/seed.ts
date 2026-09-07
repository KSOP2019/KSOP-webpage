import type { EventItem, NewsItem, PlayerItem, SiteContent } from './types'

const eventNames = [
  'NLH Poker Players Championship / Day 1A',
  'NLH Warm-up',
  'NLH Good Game 500',
  'PLO Kick-off',
  'NLH Deepstack',
  'PLO Night',
  'NLH Bigstack Hyper',
  'Satellite to #25 NLH Good Game 1000',
  'Main Event Day 1',
  'High Roller Championship',
]

const eventTypes = ['NLH', 'NLH', 'NLH', 'PLO', 'NLH', 'PLO', 'NLH', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER'] as const

export function createSeedEvents(): EventItem[] {
  return Array.from({ length: 100 }, (_, index) => {
    const day = Math.min(22, 17 + Math.floor(index / 17))
    const name = eventNames[index % eventNames.length]
    const type = eventTypes[index % eventTypes.length]

    return {
      id: `event-${index + 1}`,
      date: `NOV ${day}`,
      dayLabel: `DAY ${index + 1}`,
      name: `${name} #${index + 1}`,
      type,
      buyInType: 'INVITATION',
      buyIn: ['₩8,000', '₩10,000', '₩12,000', '₩25,000', '₩50,000'][index % 5],
      gtd: ['₩8,000', '₩10,000', '₩12,000', '₩25,000', '₩50,000'][index % 5],
      startingChips: 15000,
      lateReg: 'LEVEL 8',
      levelTime: '15 MIN',
      blindStructure: [
        { level: 1, small: 100, big: 200, ante: 200 },
        { level: 2, small: 200, big: 400, ante: 400 },
      ],
      published: true,
    }
  })
}

export const seedPlayers: PlayerItem[] = [
  { id: 'jun-hyuk-lee', rank: 1, name: 'JUN-HYUK LEE', country: 'KR', earnings: '₩ 218,400,000', portrait: '/images/ksop-player-1.png', bio: 'KSOP ranking leader known for deep runs and disciplined late-game decisions.', published: true },
  { id: 'daniel-lim', rank: 2, name: 'DANIEL LIM', country: 'KR', earnings: '₩ 164,800,000', portrait: '/images/ksop-player-2.png', published: true },
  { id: 'min-seok-kim', rank: 3, name: 'MIN-SEOK KIM', country: 'KR', earnings: '₩ 129,500,000', portrait: '/images/ksop-player-3.png', published: true },
  { id: 'alex-park', rank: 4, name: 'ALEX PARK', country: 'US', earnings: '₩ 98,200,000', published: true },
  { id: 'so-yeon-han', rank: 5, name: 'SO-YEON HAN', country: 'KR', earnings: '₩ 82,600,000', published: true },
  { id: 'ryan-choi', rank: 6, name: 'RYAN CHOI', country: 'CA', earnings: '₩ 74,300,000', published: true },
  { id: 'jae-won-park', rank: 7, name: 'JAE-WON PARK', country: 'KR', earnings: '₩ 68,900,000', published: true },
  { id: 'michael-kim', rank: 8, name: 'MICHAEL KIM', country: 'US', earnings: '₩ 59,400,000', published: true },
  { id: 'hye-jin-seo', rank: 9, name: 'HYE-JIN SEO', country: 'KR', earnings: '₩ 51,200,000', published: true },
  { id: 'david-kang', rank: 10, name: 'DAVID KANG', country: 'AU', earnings: '₩ 46,800,000', published: true },
]

export const seedNews: NewsItem[] = [
  {
    slug: 'how-a-final-table-finds-its-rhythm',
    category: 'FIELD NOTES',
    date: '12.09.25',
    title: 'How a final table finds its rhythm',
    excerpt: 'Inside the tempo shifts that define a championship final table.',
    body: 'The final table rarely announces itself with fireworks. Instead, it settles into a rhythm — a sequence of small decisions that compound into a defining arc for the entire series.',
    published: true,
  },
  {
    slug: 'jun-hyuk-lee-playing-the-long-game',
    category: 'PLAYER PORTRAIT',
    date: '08.09.25',
    title: 'JUN-HYUK LEE: PLAYING THE LONG GAME',
    excerpt: 'A portrait of the current KSOP ranking leader.',
    body: 'JUN-HYUK LEE built his ranking through consistency rather than spectacle — patient lines, selective aggression, and a reputation for reading pressure points late in tournaments.',
    published: true,
  },
  {
    slug: 'seoul-after-dark-the-city-around-the-felt',
    category: 'KSOP JOURNAL',
    date: '01.09.25',
    title: 'Seoul, after dark: the city around the felt',
    excerpt: 'The city outside the arena becomes part of the KSOP experience.',
    body: 'When the cards pause, Seoul keeps moving. From Grand Hyatt to the late-night streets, the city offers its own rhythm to players between sessions.',
    published: true,
  },
]

export const seedContent: SiteContent = {
  heroImage: '/images/ksop-hero-arena.png',
  logoBlack: '/images/ksop-logo-black.png',
  logoWhite: '/images/ksop-logo-white.png',
  seriesDate: '17 NOV 2026',
  seriesVenue: 'SEOUL · GRAND HYATT',
  seriesGtd: '₩1,500,000,000 GTD',
  countdownDays: 75,
  introTitle: 'More than\na tournament.',
  introBody: "KSOP is a meeting place for Korea's sharpest minds, boldest plays, and most unforgettable stories.",
  imageBreakLabel: 'THE TABLE IS SET',
  imageBreakTitle: 'See you',
  imageBreakEmphasis: 'at the felt.',
  copy: {
    EN: {
      ticker: '[LIVE NEXT EVENT] SEOUL GRAND PRIX · COUNTDOWN: 75D : 00H : 00M : 00S',
      nav: ['SCHEDULE', 'EVENT', 'RANKING', 'NEWS', 'ABOUT'],
      eyebrow: 'THE KOREA SERIES OF POKER · 2026',
      hero: 'THE PINNACLE OF LIVE POKER',
      intro: 'Where discipline meets instinct. A new standard for live poker in Korea.',
      register: 'REGISTER NOW',
      explore: 'EXPLORE EVENTS',
      guaranteed: 'GUARANTEED PRIZE POOL',
      invitation: 'INVITATION',
      stack: 'STARTING STACK',
      reg: 'REGISTRATION',
      schedule: 'EVENTS',
      ranking: 'TOP PLAYERS',
      news: 'INSIDE THE STORY.',
      follow: 'FOLLOW THE SERIES',
    },
    KR: {
      ticker: '[LIVE NEXT EVENT] 서울 그랑프리 · 카운트다운: 14일 : 08시간 : 42분 : 12초',
      nav: ['일정', '이벤트', '랭킹', '뉴스', 'KSOP 소개'],
      eyebrow: '코리아 시리즈 오브 포커 · 2026',
      hero: '라이브 포커의 정점',
      intro: '절제와 본능이 만나는 곳. 한국 라이브 포커의 새로운 기준.',
      register: '지금 등록하기',
      explore: '이벤트 보기',
      guaranteed: '보장 상금',
      invitation: 'INVITATION',
      stack: '스타팅 스택',
      reg: '등록 마감',
      schedule: '주요 이벤트',
      ranking: '탑플레이어',
      news: '시리즈의 이야기.',
      follow: '시리즈 팔로우',
      buyin: '바이인',
    },
    JP: {
      ticker: '[LIVE NEXT EVENT] ソウル・グランプリ · カウントダウン: 14日 : 08時間 : 42分 : 12秒',
      nav: ['スケジュール', 'イベント', 'ランキング', 'ニュース', 'KSOPについて'],
      eyebrow: 'コリアシリーズオブポーカー · 2026',
      hero: 'ライブポーカーの頂点',
      intro: '規律と本能が出会う場所。韓国ライブポーカーの新基準。',
      register: '今すぐ登録',
      explore: 'イベントを見る',
      guaranteed: '保証賞金',
      buyin: 'バイイン',
      stack: 'スターティングスタック',
      reg: '登録期間',
      schedule: '主要イベント',
      ranking: 'トッププレイヤー',
      news: 'シリーズの物語。',
      follow: 'シリーズをフォロー',
    },
    CN: {
      ticker: '[LIVE NEXT EVENT] 首尔大奖赛 · 倒计时: 14天 : 08小时 : 42分 : 12秒',
      nav: ['赛程', '赛事', '排名', '新闻', '关于KSOP'],
      eyebrow: '韩国扑克系列赛 · 2026',
      hero: '现场扑克的巅峰',
      intro: '纪律与本能相遇的地方。韩国现场扑克的新标准。',
      register: '立即报名',
      explore: '查看赛事',
      guaranteed: '保证奖金',
      buyin: '买入',
      stack: '起始筹码',
      reg: '报名截止',
      schedule: '主要赛事',
      ranking: '顶尖选手',
      news: '系列故事。',
      follow: '关注赛事',
    },
  },
}
