import type { TaskVoucher } from '../tasks/taskTypes'

/**
 * 교사 관리 파일: 부스에서 교환권 바코드를 찍었을 때 쓰는 사용 처리.
 * 학생 6번 과제(src/tasks/task06VoucherUse.ts)와 같은 일을 하지만, 축제 화면은 학생 진행과 상관없이 이 함수를 씁니다.
 * 학생 함수의 결과는 "함수 결과 그대로 보기(#lab)" 화면에서 따로 볼 수 있습니다.
 * 안내 문구는 동아리 학생들이 정한 말로 바꿔 넣으면 됩니다.
 */
export const VOUCHER_USE_TEXT = {
  missing: '없는 교환권이에요. 다시 스캔해 주세요.',
  used: '이미 사용한 교환권이에요.',
  cancelled: '취소된 교환권이에요.',
  done: '스캔 완료! 사용 처리됐어요.',
}

/** 아직 안 쓴(issued) 교환권만 used로 바꿉니다. 원래 목록은 고치지 않고 새 목록을 돌려줍니다. */
export function redeemAtBooth<T extends TaskVoucher>(vouchers: T[], voucherId: string): { ok: boolean; message: string; vouchers: T[] } {
  const found = vouchers.find((voucher) => voucher.id === voucherId)
  if (!found) return { ok: false, message: VOUCHER_USE_TEXT.missing, vouchers }
  if (found.status === 'used') return { ok: false, message: VOUCHER_USE_TEXT.used, vouchers }
  if (found.status === 'cancelled') return { ok: false, message: VOUCHER_USE_TEXT.cancelled, vouchers }
  const next = vouchers.map((voucher) => (voucher.id === voucherId ? { ...voucher, status: 'used' as const } : voucher))
  return { ok: true, message: VOUCHER_USE_TEXT.done, vouchers: next }
}
