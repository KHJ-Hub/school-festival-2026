# 1차 활동(10/30) 따라하기 — 설치 없이 브라우저만으로 시작하기

Surface Go에 아무것도 설치하지 않습니다. **GitHub Codespaces**(브라우저 안에서 열리는 VS Code와 터미널)로 코드를 쓰고, 테스트하고, 올립니다. Node.js와 패키지는 클라우드에서 자동으로 준비됩니다. 막히면 옆 친구에게 먼저 물어보고, 그래도 안 되면 손을 드세요.

## 교사용 진행표 (50분 × 2교시)

| 시간 | 할 일 | 목표 |
|---|---|---|
| 1교시 0~15분 | GitHub 가입, 이메일 인증, 이메일 비공개 설정 | 전원 계정 만들기 |
| 15~25분 | 사용자 이름을 교사에게 제출 → 교사가 저장소 협력자로 초대 → 학생이 메일에서 수락 | 쓰기 권한 받기 |
| 25~50분 | 내 브랜치에서 Codespace 만들기(처음 1~3분 걸림), `npm test`로 빨간 테스트 확인 | 개발 환경 완성 |
| 2교시 0~10분 | 내 담당 파일 열기, TODO와 내 테스트 읽기 | 내 과제 이해 |
| 10~40분 | BeAT에게 힌트를 물으며 TODO 하나 구현 → 내 테스트가 초록색이 되는지 확인 | 첫 성공 |
| 40~50분 | 커밋 → 푸시, 활동 기록 작성, Codespace 중지 | 내 브랜치에 올리기 |

### 수업 전에 교사가 꼭 확인할 것

1. **학교 네트워크에서 접속되는지**: 교실 Wi-Fi의 Surface Go에서 `github.com`에 로그인하고 Codespace를 하나 만들어 보세요. 주소가 `*.github.dev`, `*.app.github.dev`인 사이트가 차단되어 있으면 안 됩니다. 차단되어 있다면 정보부서에 해제를 요청하거나, 아래 "대체 방법"을 쓰세요.
2. **테스트 계정으로 한 번 해 보기**: 새 GitHub 계정으로 가입 → 초대 수락 → Codespace 생성 → `npm test` → 커밋·푸시까지 직접 해 보세요. 이 순서가 가장 막힙니다.
3. **초대 순서**: 학생이 초대를 수락한 **뒤에** Codespace를 만들어야 합니다. 수락 전에 만들면 학생의 개인 복사본(포크)이 생겨 푸시가 엉뚱한 곳으로 갑니다.
4. **사용량 한도**: 무료 개인 계정은 월 120코어시간(2코어 기준 약 60시간)을 씁니다. 8명이 수업 시간만 쓰면 충분하지만, Codespace를 켜 둔 채 퇴실하지 않도록 안내하세요(30분 지나면 자동 중지됩니다).
5. **화면이 작습니다**: Surface Go는 화면이 작으니 브라우저 확대를 80%로 줄이고(`Ctrl` + `-`), 왼쪽 탐색기와 아래 터미널만 열어 두세요.

### 대체 방법 (Codespaces가 막혔을 때)

- **github.dev**: 저장소 페이지에서 `.` 키를 누르면 설치 없이 편집기가 열립니다. 다만 터미널이 없어 테스트를 돌릴 수 없고, 코드 읽기·수정·커밋만 가능합니다.
- **StackBlitz**: 공개 저장소일 때 `https://stackblitz.com/github/KHJ-Hub/school-festival-2026/tree/브랜치이름`으로 브라우저에서 실행할 수 있습니다. 푸시는 별도 연결이 필요해서, 막혔을 때의 임시 방법으로만 쓰세요.

## 학생용 1단계 — GitHub 가입

1. <https://github.com> 에서 **Sign up**을 누릅니다.
2. 이메일은 **본인이 확인할 수 있는 개인 메일**을 씁니다. (학교 메일은 외부 메일 수신이 막혀 있을 수 있습니다.)
3. 사용자 이름(username)은 **실명·학번·학교 이름이 들어가지 않는 별명**으로 정합니다. 예: `starfox-dev`
4. 이메일로 온 인증 코드를 입력합니다.
5. 오른쪽 위 프로필 → **Settings → Emails**에서 아래 두 개를 켭니다.
   - **Keep my email addresses private**
   - **Block command line pushes that expose my email**
6. 내 **사용자 이름**을 교사에게 알려 주고, 초대 메일이 오면 **Accept invitation**을 누릅니다.

> 비밀번호와 인증 코드는 다른 사람에게 알려 주지 않습니다. 이 프로젝트에는 실제 학번·이름·전화번호를 올리지 않습니다.

## 학생용 2단계 — 내 브랜치 번호 확인

| 번호 | 브랜치 | 담당 파일 |
|---|---|---|
| 1 | `feature/student-1-lookup` | `src/tasks/task01StudentLookup.ts` |
| 2 | `feature/student-2-coin-request` | `src/tasks/task02CoinGrant.ts` |
| 3 | `feature/student-3-coin-summary` | `src/tasks/task03CoinSummary.ts` |
| 4 | `feature/student-4-snack-menu` | `src/tasks/task04SnackMenu.ts` |
| 5 | `feature/student-5-voucher-issue` | `src/tasks/task05VoucherIssue.ts` |
| 6 | `feature/student-6-voucher-use` | `src/tasks/task06VoucherUse.ts` |
| 7 | `feature/student-7-coin-ranking` | `src/tasks/task07GameRanking.ts` |
| 8 | `feature/student-8-voucher-card` | `src/tasks/task08StudentVoucherCard.tsx` |

## 학생용 3단계 — 내 브랜치로 Codespace 열기

1. 브라우저에서 저장소 `https://github.com/KHJ-Hub/school-festival-2026` 를 엽니다.
2. 왼쪽 위 브랜치 선택 버튼(처음엔 `main`)을 눌러 **2단계 표의 내 브랜치**를 고릅니다. 화면에 내 브랜치 이름이 보이는지 확인합니다.
3. 초록색 **Code** 버튼 → **Codespaces** 탭 → **Create codespace on feature/student-…** 를 누릅니다.
4. 1~3분 기다리면 브라우저 안에 VS Code가 열립니다. 아래쪽 터미널에서 설치가 끝날 때까지 기다립니다.
5. 터미널에 입력합니다.

```bash
npm test
```

**빨간 실패가 나오는 것이 정상**입니다. 아직 내가 코드를 안 썼기 때문입니다.

> 화면 확인: 터미널에 `npm run dev`를 입력하면 오른쪽 아래에 알림이 뜹니다. **Open in Browser**를 누르고 **운영진용** 버튼을 누르면 내 함수의 결과가 보입니다. 끝낼 때는 터미널에서 `Ctrl` + `C`를 누릅니다.

## 학생용 4단계 — 내 과제 하나 구현하기

1. 왼쪽 파일 목록에서 내 담당 파일을 엽니다.
2. `TODO` 주석을 읽고, 한 줄씩 직접 써 봅니다.
3. 내 테스트만 실행합니다. 예: 학생 3이면 `npx vitest run task03`
4. 빨간색이 초록색으로 바뀌면 성공입니다.
5. 테스트를 고쳐서 통과시키지 않습니다. 이해되지 않는 테스트는 교사에게 질문합니다.

### BeAT(AI)를 쓸 때 지킬 것

- **정답 전체를 요청하지 말고 힌트를 요청합니다.** 예: "이 정규식의 각 기호가 무슨 뜻인지만 알려줘."
- AI가 준 코드는 **그대로 붙여 넣지 말고**, 한 줄씩 무슨 뜻인지 설명할 수 있을 때만 씁니다.
- 실제 학번·이름·전화번호, 비밀번호는 AI에 입력하지 않습니다.
- 어떤 질문을 하고 무엇을 고쳤는지 `docs/ACTIVITY_LOG_TEMPLATE.md`의 "AI를 활용한 작업"에 적습니다.

## 학생용 5단계 — 내 브랜치에 올리기

터미널에서 입력합니다.

```bash
git status
git add src/tasks/내파일이름
git commit -m "feat: 학생 N 첫 구현"
git push
```

- Codespaces에서는 GitHub 로그인이 이미 되어 있어서 따로 로그인하지 않아도 됩니다.
- `403` 오류가 나면 초대 수락을 아직 안 한 것입니다. 메일을 확인하고 교사에게 알려 주세요.
- `git status`에 내 담당 파일 말고 다른 파일이 보이면 교사에게 물어보세요.
- **다른 학생 브랜치와 `main`에는 올리지 않습니다.**

끝나면 `docs/ACTIVITY_LOG_TEMPLATE.md`를 복사해 오늘 한 일을 적고, 왼쪽 아래 **Codespaces** 메뉴에서 **Stop Current Codespace**로 중지합니다.
