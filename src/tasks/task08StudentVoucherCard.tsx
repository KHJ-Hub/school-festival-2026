import type { CoinExchangeRequest, TaskVoucher } from './taskTypes'

type StudentVoucherCardProps = {
  voucher: TaskVoucher
  menuName: string
  coinRequests?: CoinExchangeRequest[]
}

export function StudentVoucherCard({ voucher, menuName, coinRequests = [] }: StudentVoucherCardProps) {
  // TODO(학생 8 / Issue #11): pending/approved/rejected 신청 상태와 교환권 상태를 읽기 전용으로 표시하세요.
  // 버튼을 추가하지 마세요. 학생용 화면은 조회 전용이어야 합니다.
  return (
    <article className="voucher">
      <div className="voucher-body">
        <span className={`status ${voucher.status}`}>{voucher.status}</span>
        <h3>{menuName}</h3>
        <p>코인 신청 {coinRequests.length}건 · 학생용 상태 카드 TODO</p>
      </div>
    </article>
  )
}


