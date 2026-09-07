# KSOP 2026 웹사이트·관리자 설치 안내

## 현재 구현된 기능

### 공개 사이트
- 실제 데이터 기반 홈 화면
- 날짜 기반 실시간 카운트다운
- 시리즈 목록 및 `/schedule/[series-slug]` 상세 페이지
- 이벤트 목록 및 `/events/[event-slug]` 상세 페이지
- 선수 랭킹 및 `/players/[player-slug]` 상세 페이지
- 뉴스 목록 및 `/news/[article-slug]` 상세 페이지
- ABOUT 목록 및 `/about/[page-slug]` 상세 페이지
- 기존 `/event` → `/events` 리다이렉트
- 반응형 모바일 화면과 reduced-motion 지원
- 페이지별 기본 SEO, robots, sitemap
- 기본 보안 헤더

### 관리자 `/admin`
- Supabase 이메일 로그인
- 홈 제목·설명·버튼·색상·SNS 수정
- 시리즈 추가·수정·보관
- 이벤트 추가·수정·보관
- 선수·순위 추가·수정·보관
- 뉴스 추가·수정·보관
- ABOUT 페이지 추가·수정·보관
- 이미지·PDF 업로드
- 공개/작성 중/보관 상태
- 모바일 관리자 UI
- 데이터 변경 감사 로그(DB)

Supabase를 연결하지 않은 상태에서도 샘플 데이터를 이용해 전체 화면과 관리자 UI를 미리 볼 수 있다. 미리보기 모드의 수정은 저장되지 않는다.

## Supabase 연결 순서

1. https://supabase.com 에서 새 프로젝트를 만든다.
2. Supabase의 `SQL Editor`를 연다.
3. 프로젝트의 `supabase/schema.sql` 전체를 붙여넣고 실행한다.
4. `Authentication → Users`에서 관리자 사용자를 만든다.
5. 생성된 사용자의 UUID를 복사한다.
6. SQL Editor에서 아래 명령을 실행한다.

```sql
insert into public.admin_users(user_id, role)
values ('관리자-사용자-UUID', 'owner');
```

7. Supabase `Project Settings → API`에서 Project URL과 anon public key를 확인한다.
8. Vercel 프로젝트의 `Settings → Environment Variables`에 아래 두 값을 입력한다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=공개_ANON_KEY
```

9. Vercel에서 다시 배포한다.
10. `사이트주소/admin`에서 로그인한다.

## 절대로 공개하면 안 되는 정보

- Supabase 데이터베이스 비밀번호
- `service_role` key
- GitHub 비밀번호·토큰
- Vercel 로그인 정보

현재 관리자 구현은 브라우저용 anon key와 Supabase RLS를 사용한다. anon key는 공개되어도 되는 키지만, RLS 정책은 반드시 `schema.sql` 그대로 적용해야 한다.

## 콘텐츠 입력 권장 순서

1. 대회 일정에서 시리즈 생성
2. 생성한 시리즈의 ID를 확인
3. 세부 이벤트에서 `소속 대회 ID`에 입력
4. 선수와 순위 입력
5. 뉴스 입력
6. 홈 화면 꾸미기
7. 작성 중 상태로 미리보기 후 공개 상태로 변경

## 로컬 실행

```bash
corepack pnpm install
corepack pnpm dev
```

운영 빌드 확인:

```bash
corepack pnpm build
```

## 이번 버전 이후 권장 작업

- 이벤트 편집 화면에서 시리즈 ID 대신 시리즈명 선택 메뉴 제공
- 한국어/영어/일본어/중국어 번역 테이블과 편집 UI
- 랭킹 시즌·대회 결과 별도 테이블
- 관리자 변경 이력 조회 및 1클릭 복원 화면
- 이미지 서버 측 재인코딩 및 악성 파일 검사
- 등록 폼의 개인정보 동의와 별도 안전한 API
- 실제 운영 데이터 확정 후 샘플 문구 전면 교체
