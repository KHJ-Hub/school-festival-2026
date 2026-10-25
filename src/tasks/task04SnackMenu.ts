import type { SnackMenu } from './taskTypes'

export function findEnabledMenu(_menus: SnackMenu[], _menuId: string): SnackMenu | undefined {
  // TODO(학생 4): 판매 중인(enabled) 간식만 찾을 수 있게 구현하세요.
  return undefined
}

export function canAffordMenu(_approvedBalance: number, _menu: SnackMenu): boolean {
  // TODO(학생 4 / Issue #7): 승인 완료된 잔액만으로 교환 가능한지 확인하세요.
  // pending 신청 수량은 approvedBalance에 포함되면 안 됩니다.
  return false
}


