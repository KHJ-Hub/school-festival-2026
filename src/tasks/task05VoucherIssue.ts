import type { SnackMenu, TaskVoucher } from './taskTypes'

export type VoucherIssueResult = { ok: boolean; message: string; vouchers: TaskVoucher[] }

export function issueVoucher(
  vouchers: TaskVoucher[],
  _studentId: string,
  _menu: SnackMenu,
  _balance: number,
): VoucherIssueResult {
  // 1. 판매 중지 메뉴인지 먼저 확인
  if (!_menu.enabled) {
    return {
      ok: false,
      message: '판매 중지된 메뉴는 교환권을 발급할 수 없습니다.',
      vouchers, // 원본 그대로 반환
    }
  }

  // 2. 잔액이 부족한지 확인 (cost 보다 적으면 실패)
  if (_balance < _menu.cost) {
    return {
      ok: false,
      message: '잔액이 부족해서 교환권을 발급할 수 없습니다.',
      vouchers, // 원본 그대로 반환
    }
  }

  // 3. 새로 발급할 교환권 ID 만들기
  //    - 기존 ID와 겹치지만 않으면 되므로, 가장 큰 숫자+1 또는 개수+1 등 사용 가능
  //    - 여기서는 "숫자 ID만 모아서 최댓값 + 1" 을 사용
  const numericIds = vouchers
    .map((v) => Number(v.id))
    .filter((n) => !Number.isNaN(n))

  const nextIdNumber = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
  const newId = String(nextIdNumber)

  const newVoucher: TaskVoucher = {
    id: newId,
    studentId: _studentId,
    menuId: _menu.id,
    cost: _menu.cost,
    status: 'issued',
  }

  // 4. 기존 배열은 건드리지 않고, 새 배열을 만들어 반환
  return {
    ok: true,
    message: '교환권이 정상적으로 발급되었습니다.',
    vouchers: [...vouchers, newVoucher],
  }
}
