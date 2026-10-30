# 축제 모바일 교환권 프로젝트 — 한 장 요약 카드

**내 번호: ____ 번 / 내 브랜치: feature/student-____-__________ / 내 파일: src/tasks/task__________**

## 시작하기 (설치 없음, 브라우저만)

1. **Chrome**으로 github.com 가입 (멈추면 시크릿 창 → 그래도 안 되면 Edge) → **학교 구글 메일**로 가입, 사용자 이름은 **별명**
2. Settings → Emails → **Keep my email addresses private** 켜기
3. 사용자 이름을 선생님께 알려 주고, 메일의 **초대 수락** (메일 제목에 `school-festival-2026`이 있는지 확인)
4. 저장소 페이지에서 **내 브랜치 선택 → Code → Codespaces → Create codespace** (처음엔 **몇 분** 걸림, 기다리기)
5. "작성자를 신뢰합니까?" 창이 뜨면 **예, 신뢰합니다** (Edge는 주소줄 아래 "제한 모드" 줄에서 **관리 → 신뢰**). 터미널에 입력 줄이 안 나오면 **☰ → 터미널 → 새 터미널**
6. 터미널에 `npm test` → **빨간색이 정상** (`30 failed | 28 passed` 정도, 숫자는 항목 수)

## 코딩하기 (AI에게 설명 → AI가 코드 → 내가 확인)

1. **연습**: `src/warmup/warmUp.ts` → `npx vitest run warmUp` 이 초록색이 되게 (**연습용이라 GitHub에 안 보냄**, `git add` 하지 않기)
2. **내 파일**을 열어 `TODO`와 `힌트`를 읽기
3. BeAT(`beat.busanedu.net` → 개인 도우미)에 **① 내 파일 ② 내 테스트 ③ taskTypes.ts**를 붙여 넣고 "TODO 함수 안의 코드만 써 줘, 테스트와 타입은 바꾸지 마"라고 부탁하기
4. 받은 코드를 **TODO 함수 안에만** 붙여 넣고 저장
5. `npx vitest run task0N` (N = 내 번호) → 빨간색이면 **오류 메시지를 BeAT에 붙여 넣고** 고쳐 달라고 하기
6. 초록색이 되면 **옆 친구에게 설명하기** (모르는 줄은 BeAT에게 질문)

## 올리기 (내 코드를 GitHub로 보내기 = push)

```
git status
git add src/tasks/내파일이름
git commit -m "feat: 학생 N 첫 구현"
git push
```

## 꼭 지킬 것

- 테스트 파일·타입 파일·다른 사람 파일은 **고치지 않기**, `main`에는 **push 하지 않기**
- 실수로 다른 파일을 고쳤으면(`git status`에 `modified`로 보임) `git restore 파일경로`로 **되돌리기**
- `npm install`로 새 라이브러리 설치하지 않기
- 실제 학번·이름·전화번호·비밀번호를 BeAT나 코드에 **쓰지 않기** (가상 학번은 9로 시작하는 5자리)
- 끝나면 **활동 기록 쓰기**, 왼쪽 아래 **Codespaces → Stop Current Codespace**

## 막히면

`403` 오류 → 초대 수락 안 함 / 화면이 안 열림 → 선생님께 / 터미널 명령이 낯설면 → 옆 친구와 한 줄씩
