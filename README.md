# KSOP — Korea Series of Poker

Next.js 16 + React 19 + Supabase 기반 KSOP 공개 사이트 및 관리자 Content Studio입니다.

## 실행

```bash
corepack pnpm install
corepack pnpm dev
```

- 공개 사이트: `http://localhost:3000`
- 관리자: `http://localhost:3000/admin`

Supabase를 연결하지 않아도 샘플 데이터 기반 미리보기로 실행됩니다. 실제 저장 기능을 사용하려면 `supabase/schema.sql`을 적용하고 `.env.example`을 참고해 환경변수를 설정하세요.

자세한 한국어 설치 안내: [IMPLEMENTATION_KR.md](./IMPLEMENTATION_KR.md)

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

비밀번호, service role key, GitHub 토큰을 저장소에 커밋하지 마세요.
