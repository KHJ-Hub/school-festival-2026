import type { DemoStudent } from './taskTypes'

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
