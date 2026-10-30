import { describe, expect, it } from 'vitest'
import { DEMO_MENUS, DEMO_STUDENTS } from '../fixtures'
import { canAffordMenu, findDemoStudent, findEnabledMenu, isDemoStudentId } from '../task01LookupAndMenu'

const menu = { id: 'a', name: 'a', cost: 2, enabled: true }

describe('학생 1 — 1부: 학번 검사와 학생 찾기', () => {
  it('숫자 5자리 학번은 참이다', () => {
    expect(isDemoStudentId('90001')).toBe(true)
    expect(isDemoStudentId('10315')).toBe(true)
  })

  it('형식이 틀리면 거짓이다', () => {
    for (const bad of ['9000', '900011', '9000a', 'F-1001', '9 0001', '', ' ']) {
      expect(isDemoStudentId(bad)).toBe(false)
    }
  })

  it('존재하는 학생을 찾는다', () => {
    expect(findDemoStudent(DEMO_STUDENTS, '90001')?.nickname).toBe('별빛여우')
  })

  it('앞뒤 공백을 정리해서 찾는다', () => {
    expect(findDemoStudent(DEMO_STUDENTS, '  90002 ')?.studentId).toBe('90002')
  })

  it('없는 학번이나 잘못된 입력은 undefined', () => {
    expect(findDemoStudent(DEMO_STUDENTS, '99999')).toBeUndefined()
    expect(findDemoStudent(DEMO_STUDENTS, '')).toBeUndefined()
    expect(findDemoStudent(DEMO_STUDENTS, '9000')).toBeUndefined()
  })

  it('원본 배열을 바꾸지 않는다', () => {
    const before = JSON.stringify(DEMO_STUDENTS)
    findDemoStudent(DEMO_STUDENTS, '90001')
    expect(JSON.stringify(DEMO_STUDENTS)).toBe(before)
  })
})

describe('학생 1 — 2부: 간식 메뉴 조회와 구매 가능 여부', () => {
  it('판매 중인 메뉴를 찾는다', () => {
    expect(findEnabledMenu(DEMO_MENUS, 'popcorn-cup')?.name).toBe('팝콘 맛보기컵')
  })

  it('판매 중지 메뉴는 반환하지 않는다', () => {
    expect(findEnabledMenu(DEMO_MENUS, 'popcorn-set')).toBeUndefined()
  })

  it('없는 메뉴는 undefined', () => {
    expect(findEnabledMenu(DEMO_MENUS, 'nothing')).toBeUndefined()
  })

  it('잔액이 비용과 정확히 같으면 살 수 있다', () => {
    expect(canAffordMenu(2, menu)).toBe(true)
  })

  it('1코인 부족하면 살 수 없다', () => {
    expect(canAffordMenu(1, menu)).toBe(false)
  })

  it('잔액이 넉넉하면 살 수 있다', () => {
    expect(canAffordMenu(10, menu)).toBe(true)
  })
})
