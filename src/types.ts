export type View = 'coins' | 'vouchers' | 'ranking'

export type Activity = {
  id: number
  booth: string
  amount: number
  time: string
}

export type Voucher = {
  id: number
  name: string
  booth: string
  price: number
  icon: string
  color: string
  status: 'available' | 'issued' | 'used'
}

export type RankingEntry = {
  rank: number
  name: string
  club: string
  game: string
  score: number
  unit: string
}


