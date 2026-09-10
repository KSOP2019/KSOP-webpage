export const countries = ['KR', 'JP', 'CN', 'US', 'CA', 'UK', 'FR', 'DE', 'AU', 'SG', 'TW', 'HK', 'TH', 'VN', 'PH']

export const firstNames = ['AIDEN', 'MIN', 'KENJI', 'LI', 'DANIEL', 'EMMA', 'SOFIA', 'MARCO', 'NOAH', 'CHLOE', 'LEO', 'MIA', 'ALEX', 'RYAN', 'DAVID', 'HANA', 'TAKAHIRO', 'YUKI', 'WEI', 'JING', 'HENRY', 'SOPHIE', 'JAMES', 'ISABELLE', 'LIAM', 'OLIVIA', 'WILLIAM', 'AVERY', 'JOHN', 'AMELIA', 'JACK', 'EVELYN', 'THOMAS', 'ABIGAIL', 'CHARLES', 'ELIZABETH', 'GEORGE', 'VICTORIA', 'EDWARD', 'CHARLOTTE', 'ARTHUR', 'GRACE', 'ALFRED', 'ALICE', 'FREDERICK', 'BEATRICE', 'HARRY', 'CATHERINE', 'ALBERT', 'MARY', 'ERNEST', 'HELEN', 'FRANK', 'MARGARET', 'SAMUEL', 'RUTH', 'JOSEPH', 'DOROTHY', 'PETER', 'JUDITH', 'BENJAMIN', 'BARBARA', 'WALTER', 'SUSAN', 'ROBERT', 'NANCY', 'MICHAEL', 'LISA', 'HENRI', 'CLAIRE', 'PIERRE', 'MARIE', 'JEAN', 'ISABELLE', 'FRANCOIS', 'SOPHIE', 'KLAUS', 'ANNA', 'FRIEDRICH', 'HEIDI', 'MAXIMILIAN', 'INGRID', 'WOLFGANG', 'SABRINA', 'HANS', 'CLAUDIA', 'OTTO', 'BRIGITTE', 'LUDWIG', 'GERTRUDE', 'FRANZ', 'MARTHA', 'GUSTAV', 'HELGA', 'RICHARD', 'ELISABETH', 'KARL', 'GERHARD', 'GUNTHER', 'HILDA', 'HEINZ', 'ILSE', 'WERNER', 'LUCIA', 'MANFRED', 'PAULA', 'SIEGFRIED', 'IRENE', 'ULRICH', 'PETRA', 'DIETRICH', 'ROSEMARIE', 'WILHELM', 'INGE', 'KURT', 'RENATE', 'BERNHARD', 'MONIKA']

export const lastNames = ['PARK', 'RYU', 'MORITA', 'CHEN', 'HAN', 'KATO', 'KIM', 'LEE', 'NGUYEN', 'WANG', 'YAMAMOTO', 'SATO', 'TANAKA', 'WATANABE', 'ITO', 'SUZUKI', 'TAKAHASHI', 'TANAKA', 'WATANABE', 'YAMAMOTO', 'SATO', 'SUZUKI', 'TAKAHASHI', 'TANAKA', 'WATANABE', 'ITO', 'KIMURA', 'NAKAMURA', 'YAMADA', 'YOSHIDA', 'ITO', 'KOBAYASHI', 'KATO', 'MATSUDA', 'NAKAMURA', 'SATO', 'SUZUKI', 'TAKAHASHI', 'TANAKA', 'WATANABE', 'YAMAMOTO', 'ITO', 'WATANABE', 'ITO', 'SUZUKI', 'TAKAHASHI', 'TANAKA', 'WATANABE', 'ITO', 'SUZUKI', 'TAKAHASHI', 'TANAKA', 'WATANABE', 'ITO', 'WATANABE']

export function generateSyntheticPlayers(): import('./types').PlayerItem[] {
  const players: import('./types').PlayerItem[] = []
  for (let i = 1; i <= 100; i++) {
    const country = countries[(i - 1) % countries.length]
    const first = firstNames[(i - 1) % firstNames.length]
    const last = lastNames[(i - 1) % lastNames.length]
    const slug = `test-player-${String(i).padStart(3, '0')}`
    players.push({
      id: slug,
      dbId: `synthetic-${i}`,
      rank: i,
      titles: Math.max(0, Math.round(11 - i / 10)),
      finalTables: Math.max(0, Math.round(13 - i / 8)),
      name: `${first} ${last}`,
      country,
      earnings: `₩ ${Math.round(15000000 + (101 - i) * 180000).toLocaleString('en-US')}`,
      portrait: '',
      bio: `Synthetic test player #${i} for design QA.`,
      published: true,
    })
  }
  return players
}
