import { describe, expect, it } from 'vitest'
import { welcomeMessage } from './warmUp'

describe('연습 — 환영 문장 만들기', () => {
  it('별명을 넣은 환영 문장을 만든다', () => {
    expect(welcomeMessage('별빛여우')).toBe('안녕하세요, 별빛여우님! 축제 모바일 교환권 프로젝트에 오신 것을 환영합니다.')
  })

  it('별명 앞뒤 공백은 지운다', () => {
    expect(welcomeMessage('  파란고래 ')).toBe('안녕하세요, 파란고래님! 축제 모바일 교환권 프로젝트에 오신 것을 환영합니다.')
  })

  it('별명이 비어 있으면 손님으로 부른다', () => {
    expect(welcomeMessage('')).toBe('안녕하세요, 손님님! 축제 모바일 교환권 프로젝트에 오신 것을 환영합니다.')
    expect(welcomeMessage('   ')).toBe('안녕하세요, 손님님! 축제 모바일 교환권 프로젝트에 오신 것을 환영합니다.')
  })
})
