import type { TaskVoucher } from './taskTypes'

export type VoucherUseResult = { ok: boolean; message: string; vouchers: TaskVoucher[] }

export function markVoucherUsed(vouchers: TaskVoucher[], _voucherId: string): VoucherUseResult {
  // TODO(학생 6 / Issue #9): issued 상태만 used로 변경하고 중복 사용을 거절하세요.
  // 이 함수는 교육용 시뮬레이션이며 실제 보안 검증은 서버에서 해야 합니다.
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', vouchers }
}


