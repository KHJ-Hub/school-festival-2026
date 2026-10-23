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
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', vouchers }
}


