import type { SnackMenu } from './taskTypes'

export function findEnabledMenu(_menus: SnackMenu[], _menuId: string): SnackMenu | undefined {
  // TODO(학생 4): 판매 중인(enabled) 간식만 찾을 수 있게 구현하세요.
  return undefined
}

export function canAffordMenu(_balance: number, _menu: SnackMenu): boolean {
  // TODO(학생 4): 보유 코인이 필요 코인보다 많거나 같은지 확인하세요.
  return false
}


