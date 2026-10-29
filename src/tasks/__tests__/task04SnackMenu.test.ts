import { describe, expect, it } from 'vitest'
import { DEMO_MENUS } from '../fixtures'
import { canAffordMenu, findEnabledMenu } from '../task04SnackMenu'

const menu = { id: 'a', name: 'a', cost: 2, enabled: true }

describe('학생 4 — 간식 메뉴 조회와 구매 가능 여부', () => {
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
