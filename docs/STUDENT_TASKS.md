# 학생 8인 공동 개발 과제 — 실물 코인 교환 신청 방식

이 문서는 GitHub Issue #4~#11의 최신 설명을 기준으로 합니다. 학생별 브랜치 `student-01`~`student-08`과 기존 담당 파일을 유지합니다.

> `F-1001` 형태의 가상 학번만 사용합니다. 실제 개인정보와 실제 운영 데이터는 입력하거나 커밋하지 않습니다.

## 공통 운영 흐름

`학생 제출(pending) → 운영진 실물 대조·회수 → approved/rejected → 승인 잔액 → 학생 교환권 발급 → QR 사용 완료`

- 신청만으로 사용 가능 잔액이 생기면 안 됩니다.
- `pending`과 `rejected` 수량은 잔액에서 제외합니다.
- 게임 랭킹은 코인 신청·승인 흐름과 별도입니다.
- 브라우저 데모는 보안 기능이 아닙니다.

## 작업 방법

1. 자신의 Issue와 개인 브랜치를 확인합니다.
2. 담당 `src/tasks/taskXX...` 파일의 TODO만 우선 수정합니다.
3. `docs/ACTIVITY_LOG_TEMPLATE.md`에 AI 도움과 직접 작업을 구분해 기록합니다.
4. `npm run typecheck`와 `npm run build`를 실행합니다.
5. 다른 학생 파일과 `main`은 직접 수정하지 않습니다.

공통 타입 `src/tasks/taskTypes.ts`와 통합 화면 `src/App.tsx`는 교사가 관리합니다.

## 학생 1 — 가상 학번 입력 검사와 제출자 찾기

- **Issue / 브랜치:** #4 / `student-01`
- **담당 파일:** `src/tasks/task01StudentLookup.ts`
- **목표:** 코인 교환 신청 전에 가상 학번 형식과 존재 여부를 검사합니다.
- **함수:** `isDemoStudentId`, `findDemoStudent`
- **테스트:** 빈 값, 형식 오류, 없는 학생, 정상 ID
- **완료 기준:** 정리된 입력으로 정확한 가상 학생만 반환하고 원본 배열을 수정하지 않습니다.

## 학생 2 — 학생의 실물 코인 수량 제출

- **Issue / 브랜치:** #5 / `student-02`
- **담당 파일:** `src/tasks/task02CoinGrant.ts`
- **목표:** 양의 정수 수량을 받아 `pending` 신청을 만듭니다.
- **함수:** `isValidPhysicalCoinCount`, `submitCoinExchangeRequest`
- **테스트:** 0, 음수, 소수, 정상 수량, 제출 직후 잔액 미증가
- **완료 기준:** 정상 입력만 pending으로 추가하며 신청 자체는 승인 잔액을 변경하지 않습니다.

## 학생 3 — 운영진 확인·승인과 승인 잔액

- **Issue / 브랜치:** #6 / `student-03`
- **담당 파일:** `src/tasks/task03CoinSummary.ts`
- **목표:** 회수 수량을 대조해 pending 신청을 승인/반려하고 승인 잔액을 계산합니다.
- **함수:** `reviewCoinExchangeRequest`, `calculateApprovedCoinBalance`
- **테스트:** 승인, 반려, 수량 불일치, 재승인 방지, 학생별 승인 합계
- **완료 기준:** approved 수량만 더하고 pending/rejected는 잔액에서 제외합니다.

## 학생 4 — 승인 코인 기준 간식 선택

- **Issue / 브랜치:** #7 / `student-04`
- **담당 파일:** `src/tasks/task04SnackMenu.ts`
- **목표:** 판매 중인 메뉴를 찾고 승인된 사용 가능 잔액으로만 교환 가능 여부를 판단합니다.
- **함수:** `findEnabledMenu`, `canAffordMenu`
- **테스트:** 잔액 부족, 비용과 동일, 판매 중단, 승인 전 수량 제외
- **완료 기준:** `approvedBalance >= cost`이고 판매 중일 때만 교환 가능합니다.

## 학생 5 — 승인 코인으로 교환권 발급

- **Issue / 브랜치:** #8 / `student-05`
- **담당 파일:** `src/tasks/task05VoucherIssue.ts`
- **목표:** 승인 잔액을 확인하고 비용을 차감하는 `issued` 교환권 결과를 만듭니다.
- **함수:** `issueVoucher`
- **테스트:** 승인 전 거절, 잔액 부족, 정상 1건, 중복 클릭 고려
- **완료 기준:** 성공/실패 결과가 명확하고 실패 시 기존 데이터를 변경하지 않습니다.

## 학생 6 — QR 교환권 사용 상태 처리

- **Issue / 브랜치:** #9 / `student-06`
- **담당 파일:** `src/tasks/task06VoucherUse.ts`
- **목표:** `issued` 교환권만 `used`로 바꾸고 재사용을 거절합니다.
- **함수:** `markVoucherUsed`
- **테스트:** 정상 사용, 재사용, 취소, 없는 ID
- **완료 기준:** 허용된 상태 전이만 수행하고 결과 메시지를 반환합니다.

## 학생 7 — 게임별 기록과 자동 랭킹

- **Issue / 브랜치:** #10 / `student-07`
- **담당 파일:** `src/tasks/task07GameRanking.ts`
- **목표:** 점수형은 높은 순, 시간형은 낮은 순으로 TOP 5/10을 만듭니다.
- **함수:** `rankGameScores`
- **테스트:** 높은 점수, 짧은 시간, 다른 게임 분리, 동점 논의
- **완료 기준:** 코인 흐름과 분리된 게임별 순위를 올바른 방향으로 반환합니다.

## 학생 8 — 학생용 승인 상태와 교환권 카드

- **Issue / 브랜치:** #11 / `student-08`
- **담당 파일:** `src/tasks/task08StudentVoucherCard.tsx`
- **목표:** pending/approved/rejected 신청 상태와 issued/used/cancelled 교환권 상태를 읽기 전용으로 표시합니다.
- **컴포넌트:** `StudentVoucherCard`
- **테스트:** 신청 3상태, 교환권 3상태, 운영진 버튼 미노출, 모바일 폭
- **완료 기준:** 쉬운 한국어와 시각적 차이가 있고 조작 버튼이 없습니다.

## 실제 운영 전에 필요한 서버 기능

- 관리자 인증과 역할 권한
- 학생별 안전한 접근 토큰 또는 본인 인증
- 개인정보 최소 수집과 접근 기록
- 신청 승인과 잔액 변경의 원자적 DB 처리
- QR 서명, 만료, 원자적 1회 사용 검증
- 감사 기록, 장애 복구, 취소 정책

화면에서 승인이나 중복 방지를 흉내 내는 것만으로 실제 보안이 보장되지는 않습니다.


