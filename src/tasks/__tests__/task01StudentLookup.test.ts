import { describe, expect, it } from 'vitest'
import { DEMO_STUDENTS } from '../fixtures'
import { findDemoStudent, isDemoStudentId } from '../task01StudentLookup'

describe('학생 1 — 학번 검사와 학생 찾기', () => {
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
