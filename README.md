# SPACE SCOUTS

**NCT WISH 료 생일 카페 웹페이지** — <https://spacescouts.store>

보급품(굿즈) 목록, 방문객이 UFO를 띄워 남기는 미션 리포트 방명록, 그리고 닷지 미니게임으로
구성된 모바일 우선 웹앱입니다.

---

## 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프론트엔드 | React 19 + Vite 8 (해시 라우팅, 라우터 의존성 없음) |
| 호스팅 | Cloudflare Pages (정적 `dist/`) |
| API | Cloudflare Pages Functions — `functions/api/messages.js` |
| DB | Cloudflare D1 (`space-scouts-board`, 바인딩 이름 **`DB`**) |
| 테스트 | Playwright (시각 회귀 + 상호작용) |

빌드 산출물은 순수 정적 파일이고, 서버 로직은 방명록 API **하나뿐**입니다.
굿즈 데이터는 전부 `src/data.js`에 있는 정적 콘텐츠라 DB를 타지 않습니다.

## 라우트

해시 라우팅이므로 서버 리라이트 설정이 필요 없습니다. (`src/hooks/useHashRoute.js`)

| 해시 | 화면 |
| --- | --- |
| `#/` | 랜딩 |
| `#/menu` | 카테고리 메뉴 |
| `#/c/<subId>` | 보급품 그리드 |
| `#/i/<subId>/<itemId>/<option>` | 굿즈 상세 |
| `#/board` | 미션 리포트 방명록 |
| `#/board/admin/<key>` | 관리자 잠금 해제 (키는 저장 후 URL에서 제거) |
| `#/soon` | 전체 화면 영상 |
| `#/game` | 닷지 미니게임 — **메뉴에 노출되지 않음** (아래 참고) |

### `#/game`이 숨겨져 있는 이유

플레이 테스트 중이라 의도적으로 링크를 걸지 않았습니다. 라우트는 살아 있어 URL로 직접 열 수
있지만, UI 어디에도 진입점이 없어 TRAINING CENTER는 `#/soon`으로 빠집니다.
공개하려면 `src/data.js`의 `training-center` 항목에서 주석 처리된 `link: "#/game"` 한 줄만
되살리면 됩니다. 이 상태는 테스트로 고정돼 있습니다 —
*"the game is reachable by URL but unlisted in the menu"*.

## 구조

```
src/
  App.jsx            라우트 → 화면. 전체 화면 뷰(랜딩/게임/영상)는 여기서 조기 반환
  viewConfig.jsx     앱바가 필요한 라우트의 제목·색·아이콘을 한곳에서 결정
  data.js            굿즈 카탈로그 (정적 콘텐츠의 단일 출처)
  hooks/             해시 라우터
  components/        공용 UI + 굿즈 화면
  board/             방명록 (API 클라이언트, 배치 로직, UFO 컴포저)
  game/              닷지 엔진 — React 비의존, 캔버스 + 자체 rAF 루프
functions/api/       Pages Function (방명록 API)
tests/               Playwright 스위트
schema.sql           D1 스키마
```

## 로컬 개발

```bash
npm install
npm run dev          # http://localhost:5173
```

`npm run dev`에는 Functions가 없어 방명록이 `localStorage`로 대체 동작합니다.
**실제 API와 D1까지 포함해 확인하려면** Pages 런타임을 써야 합니다:

```bash
npm run preview:pages    # 빌드 후 wrangler pages dev dist
```

`public/_headers`(보안 헤더)도 이 경로에서만 적용됩니다. `vite dev`와 `vite preview`는
`_headers`를 읽지 않으므로, 헤더를 건드렸다면 반드시 위 명령으로 검증하세요.

## 테스트

```bash
npm test              # 시각 회귀 + 상호작용 (dev 서버 자동 기동)
npm run test:failure  # 방명록 실패 경로 (프로덕션 빌드 필요)
npm run typecheck     # JSDoc 기반 tsc
```

`tests/baseline.spec.js`는 **리팩터링이 픽셀을 바꾸지 않았음을 증명하기 위한** 스위트입니다.
`tests/seed.js`가 `Math.random`을 시드 PRNG로 교체하고 방명록에 고정 데이터를 주입해,
셔플되는 그리드와 게임 별밭까지 매 실행 동일하게 렌더링됩니다.

> 스냅샷은 OS별로 파일이 갈립니다(`-win32`, `-darwin`). 다른 OS에서 처음 돌리면 기준
> 이미지가 없어 새로 생성되니, 그 결과를 커밋하기 전에 실제 변경인지 먼저 확인하세요.

## 배포

절차 전체(로그인, D1 생성, 마이그레이션, 시크릿 등록)는 **[DEPLOY.md](DEPLOY.md)** 에 있습니다.
요약하면:

```bash
npm run build
npx wrangler pages deploy dist
```

Pages 대시보드의 Git 연동으로 배포한다면 **`wrangler.toml`을 읽지 않습니다.**
Settings → Functions → D1 bindings 에서 바인딩 이름을 **`DB`** 로 직접 걸어야 하며,
빠뜨리면 Function에 DB가 없는 채로 배포돼 방명록이 통째로 실패합니다.

---

## 보안

### 반드시 등록해야 하는 시크릿

둘 다 Cloudflare의 암호화 시크릿이며 **리포에 절대 들어가지 않습니다.**

| 시크릿 | 없을 때 | 등록 |
| --- | --- | --- |
| `RATE_SALT` | 동작은 하지만 **리포에 공개된 고정 솔트로 폴백** — IP 해시를 되돌릴 수 있게 됨 | `npx wrangler pages secret put RATE_SALT` |
| `ADMIN_KEY` | 관리자 삭제 비활성화 (작성자 본인 삭제는 정상) | `npx wrangler pages secret put ADMIN_KEY` |

`RATE_SALT`는 특히 **설정 안 하면 조용히 약해집니다.** 에러가 나지 않으니 배포 후 반드시 확인하세요.
로컬은 `.dev.vars`(gitignore 처리됨)에 같은 이름으로 넣으면 됩니다.

### 커밋해도 되는 것

`wrangler.toml`의 `database_id`는 시크릿이 아닙니다. 리소스 식별자일 뿐이고 접근에는 계정
자격증명이 따로 필요하므로 의도적으로 커밋되어 있습니다. 자격증명·토큰·솔트는 하나도 없습니다.

### API 방어 (`functions/api/messages.js`)

- **SQL 인젝션** — 모든 쿼리가 `.bind()` 프리페어드 스테이트먼트. 문자열 연결 없음
- **입력 검증** — 본문 ≤ 80자, 색상 `#RRGGBB` 정규식, 좌표 `0..1`, 토큰 필수. 어긋나면 `400`
- **쓰기 제한** — IP당 10분에 5건. IP는 저장하지 않고 솔트 SHA-256 해시만 보관
- **삭제 권한** — 작성자는 UFO별 랜덤 토큰, 운영자는 `ADMIN_KEY`
- **타이밍 공격** — 토큰/관리자 키 비교는 상수 시간(`secretsMatch`). `===`는 첫 불일치에서
  중단되므로 응답 시간이 맞은 접두사 길이를 흘리고, 반복 요청으로 한 글자씩 복원될 수 있음
- **정보 노출** — `token`과 `ip_hash`는 응답에 절대 포함되지 않음. D1 오류는 `{"error":"db"}`
  로 감싸 스택 트레이스가 새지 않게 함

### 응답 헤더 (`public/_headers`)

`script-src 'self'`가 핵심입니다. 프로덕션 빌드는 `<script src>` 하나에 인라인 스크립트가
0개라, 주입된 스크립트나 `on*` 핸들러는 실행될 수 없습니다.

`style-src`의 `'unsafe-inline'`은 제거할 수 없습니다 — React가 인라인 `style` 속성을 쓰고
(칩 그리드의 `--chip-cols`, UFO별 색상) `react-colorful`도 같은 방식입니다.
인라인 *스타일*은 코드를 실행하지 못하므로 스크립트 대비 위험이 훨씬 낮습니다.

CSP의 각 소스는 추측이 아니라 **7개 라우트의 실제 요청을 전수 기록해서** 도출했습니다.
외부 스크립트·폰트·API 호스트를 추가하면 이 파일도 함께 고쳐야 하며, 그러지 않으면 브라우저가
차단합니다.

HSTS는 여기 넣지 않았습니다. 한번 켜면 브라우저가 최대 1년간 캐시해 되돌리기 어려우므로,
Cloudflare 대시보드(SSL/TLS → Edge Certificates)에서 의도적으로 켜는 편이 안전합니다.

---

## 커밋 규칙

Conventional Commits를 따릅니다. 범위(scope)는 위 구조의 디렉터리 이름을 씁니다.

```
feat(game): raise difficulty — boss HP 20 to 50
fix(board): keep failed posts out of localStorage
chore(deploy): add CSP and security headers
test(game): assert the hint renders live tuning constants
docs: document required Cloudflare secrets
```

본문에는 **무엇을 했는지가 아니라 왜 했는지**를 적습니다. 무엇을 했는지는 diff가 이미 말해 줍니다.
