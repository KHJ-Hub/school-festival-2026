# 프론트엔드 교육용 골격 안내

React + TypeScript로 만든 학교 축제 실습용 데모입니다. 실제 학생 개인정보나 운영 데이터는 사용하지 않습니다.

## 실행과 검사

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## 정확한 코인 운영 흐름

1. 학생이 가상 학번과 보유한 실물 코인 수량을 제출합니다.
2. 신청은 `pending`이며 아직 사용할 수 없습니다.
3. 운영진이 실제 코인을 대조하고 회수합니다.
4. 운영진이 `approved` 또는 `rejected`로 처리합니다.
5. `approved` 수량만 사용 가능 잔액에 반영됩니다.
6. 학생이 승인 잔액으로 간식 교환권을 발급합니다.
7. QR 사용 처리된 교환권은 재사용할 수 없어야 합니다.
8. 게임 랭킹은 코인 흐름과 별도로 유지합니다.

## 학생 개발 위치

- `src/tasks/task01StudentLookup.ts`부터 `task08StudentVoucherCard.tsx`
- `docs/STUDENT_TASKS.md`: Issue #4~#11 기준 과제 안내
- `docs/ACTIVITY_LOG_TEMPLATE.md`: AI 활용과 직접 작업 기록

공통 타입 `src/tasks/taskTypes.ts`, 통합 화면 `src/App.tsx`, 내보내기 파일 `src/studentTasks.ts`는 교사가 관리합니다.

## 데모와 실제 운영의 차이

현재 화면은 새로고침하면 초기화되는 교육용 시뮬레이션입니다. 실제 운영에는 관리자 인증, 안전한 학생별 접근, 서버 데이터베이스, 동시 요청 제어, 서명된 QR, 만료와 원자적 1회 사용 검증이 필요합니다.


