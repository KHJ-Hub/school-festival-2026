import type { DemoStudent, SnackMenu } from './taskTypes'

// ───── 1부: 학번 검사와 학생 찾기 ─────

export function isDemoStudentId(_studentId: string): boolean {
  // TODO(학생 1): 숫자 5자리 학번인지 검사하세요. 예: 90001 (실제 학번도 같은 형식입니다)
  // 힌트: 정규식 `/^\d{5}$/` 과 `.test()` 를 알아보세요. 앞의 ^ 와 뒤의 $ 가 왜 필요한지 설명할 수 있어야 합니다.
  return false
}

export function findDemoStudent(_students: DemoStudent[], _studentId: string): DemoStudent | undefined {
  // TODO(학생 1): 앞뒤 공백을 제거하고, 올바른 형식일 때만 학생을 찾으세요.
  // 힌트: trim(), Array.find(), 위에서 만든 isDemoStudentId 를 다시 쓸 수 있습니다.
  return undefined
}

// ───── 2부: 간식 메뉴 조회와 구매 가능 여부 ─────

export function findEnabledMenu(_menus: SnackMenu[], _menuId: string): SnackMenu | undefined {
  // TODO(학생 1): 판매 중인(enabled) 간식만 찾을 수 있게 구현하세요.
  // 힌트: Array.find() 안에서 id 가 같고 enabled 가 true 인지 함께 확인합니다.
  return undefined
}

export function canAffordMenu(_balance: number, _menu: SnackMenu): boolean {
  // TODO(학생 1): 보유 코인이 필요 코인보다 많거나 같은지 확인하세요.
  // 힌트: > 와 >= 중 어느 것이 "같을 때도 살 수 있다"에 맞는지 테스트로 확인하세요.
  return false
}
