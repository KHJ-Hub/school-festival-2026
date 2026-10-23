import type { CoinGrant, CoinReason } from './taskTypes'

export function canGrantCoin(_grants: CoinGrant[], _studentId: string, _reason: CoinReason): boolean {
  // TODO(학생 2): 같은 학생에게 같은 사유로 이미 지급했는지 확인하세요.
  return false
}

export function addCoinGrant(grants: CoinGrant[], _studentId: string, _reason: CoinReason): CoinGrant[] {
  // TODO(학생 2): 중복이 아닐 때만 1코인 지급 내역을 새 배열로 반환하세요.
  return grants
}


