import type { TaskVoucher } from './taskTypes'

type StudentVoucherCardProps = {
  voucher: TaskVoucher
  menuName: string
}

export function StudentVoucherCard({ voucher, menuName }: StudentVoucherCardProps) {
 
// TODO(학생 8): 발급됨/사용 완료/취소 상태를 색상과 쉬운 문구로 구분하세요.
  // 버튼을 추가하지 마세요. 학생용 화면은 조회 전용이어야 합니다.
  
  const getStatusInfo = (status: TaskVoucher['status']) => {
    switch (status) {
      case 'issued':
        return { text: '발급됨', labelClass: 'status-issued' }
      case 'used':
        return { text: '사용 완료', labelClass: 'status-used' }
      case 'cancelled':
        return { text: '취소됨', labelClass: 'status-cancelled' }
    }
  }

  const { text, labelClass } = getStatusInfo(voucher.status)

  return (
    <article className="voucher">
      <div className="voucher-body">
        <span className={`status ${voucher.status} ${labelClass}`}>{text}</span>
        <h3>{menuName}</h3>
        <p>비용: {voucher.cost}코인</p>
      </div>
    </article>
  )
}
