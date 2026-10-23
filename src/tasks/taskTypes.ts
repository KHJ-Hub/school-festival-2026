/** 교사가 준비한 공통 타입입니다. 개인 과제에서는 이 파일을 수정하지 않습니다. */
export type DemoStudent = { studentId: string; nickname: string }
export type CoinReason = 'festival-entry' | 'global-ox'
export type CoinGrant = { id: string; studentId: string; reason: CoinReason; amount: number }
export type SnackMenu = { id: string; name: string; cost: number; enabled: boolean }
export type TaskVoucher = { id: string; studentId: string; menuId: string; cost: number; status: 'issued' | 'used' | 'cancelled' }
export type GameDirection = 'higher' | 'lower'
export type TaskGameScore = { id: string; gameId: string; participantCode: string; score: number }


