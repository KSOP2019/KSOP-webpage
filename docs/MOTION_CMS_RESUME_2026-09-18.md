# KSOP 홈페이지 이어가기 — 2026-09-18

상태: 미완료. 운영 배포와 CMS 저장→공개 반영 검증 전.

## 정본과 보존
- GitHub: KSOP2019/KSOP-webpage, main dbf8835c55a506dbc2dd16f3255df4cdce963627.
- 기존 Vercel ksophomepage: https://ksophomepage.vercel.app / CMS /admin.
- 기존 Supabase srkxcezthuzldxndcpkt: 이벤트25·기사2 모두 draft, motion 설정1·파트너6·영상3 보존. 이번 세션 DB 쓰기 없음.
- 기존 Sites appgprj_6aaa0b8fb9e4819190ee1c8b57af63a9: 버전10 그대로.

## 복구 소스
- 현재 작업 트리: /workspace/scratch/c8f18a519946/KSOP-webpage
- 이전 실행 소스: /workspace/scratch/03b921473e6d/ksop-webpage (원본 보존).
- 기존 Sites 자산 체크아웃: /workspace/scratch/c8f18a519946/ksop-motion-review
- checkpoint/motion-cms-20260916 브랜치에 복구 텍스트 소스를 저장. 이미지·영상 바이너리는 업로드 전이며 불완전 상태로 운영 이관 금지.
- 바이너리 원본은 기존 Sites 소스 dist/assets/에 모두 존재. public/motion/assets/로 그대로 복사하면 복구 가능. 변환·재생성 불필요.

## 이번 수정과 검증
- 이전 통합 CMS와 공개 API·라우터·페이지분할 구현 복구. 상세 번호 제거 재사용.
- 파트너 로고 변경 시 기존 파일명으로 되돌아가던 처리 보정.
- 영상/파트너 전체 비공개 시 홈에 이전 항목이 남지 않도록 빈 목록 반영.
- CMS 문구의 잘못된 이스케이프 표시 보정. 홈 문구 전체 및 메뉴 이름 편집 노출.
- 선수 그래프가 기록3개 초과 시 잘리던 좌표 계산 보정.
- 법적 안내 링크를 기존 /privacy, /terms로 연결.
- 홈 CSS 및 원본 자산19개 SHA256 일치. 신규 패키지·이미지·영상 생성 없음.
- Next 프로덕션 빌드, TypeScript, JS 구문 검사 통과.
- 로컬 HTTP 8개 공개 경로 200 + 확정 모션 앱, 미인증 API401, 관리자307→로그인 확인. 실제 운영 QA 아님.

## 2026-09-18 추가 지시 반영 및 배포 진행
- 대표 지시: 영상 파일 GitHub 저장 금지. YouTube URL 클릭 이동만 사용.
- 로컬 영상 참조 및 배경영상 CMS 입력 제거. 영상·숏츠 CMS의 YouTube URL 입력과 클릭 이동 유지.
- GitHub 플러그인 읽기/쓰기 정상. 클라우드 수동 로그인 탭 오류로 GitHub 로그인 재요청 중지.
- 이미지11개를 기존 Supabase media 버킷 motion/approved-20260918/로 원본 그대로 업로드하고 다운로드 SHA256 확인 중. Base64·변환·재생성 없음.
- /motion/assets/의 기존 이미지 경로11개는 해당 Storage 원본으로 리다이렉트. 디자인/CSS/크롭 유지.
- 원본 이관용 임시 Edge Function ksop-asset-import: JWT + 임시 토큰 해시 + 30분 만료 + 파일명/크기/SHA256 제한, 기존 파일 덮어쓰기 불가. 이관 후 즉시 410 응답으로 폐쇄할 것.
- 최신 Next 프로덕션 빌드 및 TypeScript 통과. 기존 DB 레코드/기존 파일 삭제 없음.
- checkpoint 브랜치 이미지 연결 반영 후 기존 Vercel 프리뷰 배포, 실제 API·브라우저 검증 뒤 main 운영 반영.
- CMS 로그인은 아직 미확인. 운영 CMS에서 저장→공개 반영→원문 복원 검증 전 완료 보고 금지.
- 기존 PR17/실패 배포 정리는 새 운영 검증 뒤. 현재 운영 삭제 금지.
- 회사 문의 이메일 공란은 유지. 임의 수신자 지정 금지.

실제 부서장 회의는 개최하지 않음. 확정 디자인 보존·콘텐츠 보존·원본 직접 업로드 기준으로 진행.
