import type { TaskVoucher } from './taskTypes'
import './task08StudentVoucherCard.css'

type StudentVoucherCardProps = {
  voucher: TaskVoucher
  menuName: string
}

export function StudentVoucherCard({ voucher, menuName }: StudentVoucherCardProps) {
  // TODO(학생 8): 발급됨/사용 완료/취소 상태를 색상과 쉬운 문구로 구분하세요.
  // 버튼을 추가하지 마세요. 학생용 화면은 조회 전용이어야 합니다.
  // 힌트: 상태 이름('issued' 등)을 한국어 문구로 바꿔 주는 객체 하나를 만들어 쓰세요. className 에 상태를 넣으면 색상을 바꿀 수 있습니다.
  return (
    <article className="voucher">
      <div className="voucher-body">
        <span className={`status ${voucher.status}`}>{voucher.status}</span>
        <h3>{menuName}</h3>
        <p>학생용 교환권 카드 TODO</p>
      </div>
    </article>
  )
}


