import type { SnackMenu } from './taskTypes'

export function findEnabledMenu(_menus: SnackMenu[], _menuId: string): SnackMenu | undefined {
  // TODO(학생 4): 판매 중인(enabled) 간식만 찾을 수 있게 구현하세요.
  // 힌트: Array.find() 안에서 id 가 같고 enabled 가 true 인지 함께 확인합니다.
  return undefined
}

export function canAffordMenu(_balance: number, _menu: SnackMenu): boolean {
  // TODO(학생 4): 보유 코인이 필요 코인보다 많거나 같은지 확인하세요.
  // 힌트: > 와 >= 중 어느 것이 "같을 때도 살 수 있다"에 맞는지 테스트로 확인하세요.
  return false
}
