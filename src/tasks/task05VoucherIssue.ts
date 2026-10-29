import type { SnackMenu, TaskVoucher } from './taskTypes'

export type VoucherIssueResult = { ok: boolean; message: string; vouchers: TaskVoucher[] }

export function issueVoucher(
  vouchers: TaskVoucher[],
  _studentId: string,
  _menu: SnackMenu,
  _balance: number,
): VoucherIssueResult {
  // TODO(학생 5): 잔액과 메뉴 상태를 확인해 issued 교환권을 추가하세요.
  // 실패할 때는 원래 vouchers 배열과 이해하기 쉬운 message를 반환하세요.
  // 힌트: 실패 조건(판매 중지, 잔액 부족)을 먼저 검사하고 일찍 return 합니다. 새 교환권은 [...vouchers, 새교환권].
  //       id 는 기존 것과 겹치지만 않으면 됩니다(예: 개수 + 1 을 이용).
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', vouchers }
}


