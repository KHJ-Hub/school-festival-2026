import type { DemoStudent, SnackMenu } from './taskTypes'

// ───── 1부: 학번 검사와 학생 찾기 ─────

  export function isDemoStudentId(_studentId: string): boolean {
  // 숫자 5자리인지 검사
  return /^\d{5}$/.test(_studentId)
}

export function findDemoStudent(
  _students: DemoStudent[],
  _studentId: string,
): DemoStudent | undefined {
  // 앞뒤 공백 제거
  const studentId = _studentId.trim()

  // 학번 형식이 잘못되면 찾지 않음
  if (!isDemoStudentId(studentId)) {
    return undefined
  }

  // 일치하는 학생 찾기
  return _students.find((student) => student.studentId === studentId)
}

// ───── 2부: 간식 메뉴 조회와 구매 가능 여부 ─────

export function findEnabledMenu(
  _menus: SnackMenu[],
  _menuId: string,
): SnackMenu | undefined {
  // id가 같고 판매 중인 메뉴만 찾기
  return _menus.find(
    (menu) => menu.id === _menuId && menu.enabled === true,
  )
}

export function canAffordMenu(
  _balance: number,
  _menu: SnackMenu,
): boolean {
  // 잔액이 비용과 같아도 구매 가능
  return _balance >= _menu.cost
}
