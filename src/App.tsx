import { useState } from 'react'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { CLUBS, INITIAL_COIN_EXCHANGE_REQUESTS, INITIAL_VOUCHERS, RANKINGS } from './mockData'
import type { CoinExchangeRequest, CoinExchangeStatus } from './tasks/taskTypes'
import type { View, Voucher } from './types'

const STATUS_LABEL: Record<CoinExchangeStatus, string> = {
  pending: '확인 대기',
  approved: '승인 완료',
  rejected: '반려',
}

function App() {
  const [mode, setMode] = useState<AppMode>('student')
  const [view, setView] = useState<View>('coins')
  const [approvedCoins, setApprovedCoins] = useState(2)
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS)
  const [notice, setNotice] = useState('')

  const navItems: Array<{ id: View; label: string; icon: string }> = [
    { id: 'coins', label: mode === 'student' ? '코인 교환 신청' : '코인 승인', icon: '✦' },
    { id: 'vouchers', label: mode === 'student' ? '교환권' : 'QR 사용', icon: '◇' },
    { id: 'ranking', label: '게임 랭킹', icon: '♛' },
  ]

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const exchangeVoucher = (id: number) => {
    const voucher = vouchers.find((item) => item.id === id)
    if (!voucher || voucher.status !== 'available') return
    if (approvedCoins < voucher.price) {
      showNotice('승인된 코인이 부족합니다.')
      return
    }
    setApprovedCoins((current) => current - voucher.price)
    setVouchers((current) => current.map((item) => item.id === id ? { ...item, status: 'issued' } : item))
    showNotice(`${voucher.name}을 발급했습니다. (기존 단순 데모)`)
  }

  const useVoucher = (id: number) => {
    const target = vouchers.find((item) => item.id === id)
    if (!target || target.status !== 'issued') {
      showNotice('이미 사용됐거나 처리할 수 없는 교환권입니다.')
      return
    }
    setVouchers((current) => current.map((item) => item.id === id ? { ...item, status: 'used' } : item))
    showNotice('사용 처리되었습니다. 실제 중복 검증은 서버 구현이 필요합니다.')
  }

  const changeMode = (nextMode: AppMode) => {
    setMode(nextMode)
    setView('coins')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('coins')} aria-label="첫 화면으로 이동">
          <span className="brand-mark">F!</span>
          <span><strong>모여라! 축제 연구소</strong><small>2026 연합 동아리 프로젝트</small></span>
        </button>
        <div className="header-actions">
          <ModeSwitcher mode={mode} onChange={changeMode} />
          <div className="festival-date"><span>축제까지</span><strong>12월 29일</strong></div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">{mode === 'student' ? '학생용 체험 화면' : '운영진용 확인 화면'}</p>
            <h1>놀고, 모으고,<br /><em>함께 기록해요.</em></h1>
            <p className="hero-copy">{mode === 'student' ? '실물 코인 교환을 신청하고 승인 상태·교환권·랭킹을 확인하는 기본 틀입니다.' : '회수한 실물 코인을 대조하고 신청을 승인·반려하는 기본 틀입니다.'}</p>
          </div>
          <div className="coin-card" aria-label={`승인된 사용 가능 코인 ${approvedCoins}`}>
            <span className="coin-symbol">F</span>
            <div><small>승인된 사용 가능 코인</small><strong>{approvedCoins}<span> coin</span></strong></div>
            <span className="demo-chip">DEMO</span>
          </div>
        </section>

        <div className="demo-alert" role="note">
          <span>ⓘ</span>
          <p><strong>가상 데이터 교육용 화면입니다.</strong> 신청만으로 잔액이 생기지 않으며, 화면 전환은 관리자 인증을 대신하지 않습니다. 새로고침하면 초기화됩니다.</p>
        </div>

        <nav className="tabs" aria-label="주요 화면">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>

        {view === 'coins' && (mode === 'student' ? <StudentCoinRequestView requests={INITIAL_COIN_EXCHANGE_REQUESTS} /> : <AdminCoinReviewView requests={INITIAL_COIN_EXCHANGE_REQUESTS} />)}
        {view === 'vouchers' && (mode === 'student' ? <StudentVoucherView vouchers={vouchers} onExchange={exchangeVoucher} /> : <AdminVoucherView vouchers={vouchers} onUse={useVoucher} />)}
        {view === 'ranking' && <RankingView />}
        <StudentTaskRoadmap />

        <section className="clubs"><span>함께 만드는 동아리</span><div>{CLUBS.map((club, index) => <span key={club}><i>{['♟', '⚙', '◎'][index]}</i>{club}</span>)}</div></section>
      </main>

      <footer><span>2026 학교 축제 프로젝트</span><span>실습용 프론트엔드 · 서버 연결 전</span></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

function StudentCoinRequestView({ requests }: { requests: CoinExchangeRequest[] }) {
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="section-title"><span className="title-icon coral">＋</span><div><h2>실물 코인 교환 신청</h2><p>가상 학번과 보유한 실물 코인 수량을 입력합니다.</p></div></div>
        <label>가상 학번<input value="F-1002" readOnly aria-label="가상 학번" /></label>
        <label>실물 코인 수량<input type="number" min="1" value="2" readOnly aria-label="실물 코인 수량" /></label>
        <button className="primary-button" disabled>신청 기능 연결하기 (학생 2 TODO)</button>
        <p className="helper">신청 상태는 pending입니다. 운영진 승인 전에는 사용할 수 있는 코인이 늘어나지 않습니다.</p>
      </article>
      <RequestList title="나의 신청 상태" requests={requests.filter((request) => request.studentId === 'F-1002')} />
    </section>
  )
}

function AdminCoinReviewView({ requests }: { requests: CoinExchangeRequest[] }) {
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="section-title"><span className="title-icon coral">✓</span><div><h2>실물 코인 확인</h2><p>학생의 신청 수량과 회수한 실물 코인을 대조합니다.</p></div></div>
        <div className="server-note"><strong>운영 순서</strong><span>실물 대조·회수 → 승인 또는 반려. pending 신청을 승인 잔액으로 미리 계산하면 안 됩니다.</span></div>
        <div className="request-list">{requests.filter((request) => request.status === 'pending').map((request) => <div className="request-item" key={request.id}><div><strong>{request.studentId}</strong><small>{request.physicalCoinCount}개 신청 · {request.submittedAt}</small></div><div className="review-actions"><button disabled>승인 TODO</button><button disabled>반려 TODO</button></div></div>)}</div>
      </article>
      <RequestList title="전체 신청 현황" requests={requests} />
    </section>
  )
}

function RequestList({ title, requests }: { title: string; requests: CoinExchangeRequest[] }) {
  return (
    <article className="panel">
      <div className="section-title compact"><div><h2>{title}</h2><p>가상 신청 {requests.length}건</p></div><span className="live-dot">DEMO</span></div>
      <div className="request-list">{requests.map((request) => <div className="request-item" key={request.id}><div><strong>{request.studentId} · {request.physicalCoinCount} coin</strong><small>{request.id} · {request.submittedAt}</small></div><span className={`request-status ${request.status}`}>{STATUS_LABEL[request.status]}</span></div>)}</div>
    </article>
  )
}

function StudentVoucherView({ vouchers, onExchange }: { vouchers: Voucher[]; onExchange: (id: number) => void }) {
  return (
    <section className="panel full-panel">
      <div className="section-title"><span className="title-icon yellow">◇</span><div><h2>간식 선택과 내 교환권</h2><p>승인된 코인만 사용해 교환권을 발급하는 단순 데모입니다.</p></div></div>
      <div className="student-access-note"><strong>향후 본인 확인 적용 위치</strong><span>실제 서비스에서는 안전한 개별 접근 토큰 또는 본인 인증이 필요합니다.</span></div>
      <div className="voucher-grid">{vouchers.map((voucher) => <article className={`voucher ${voucher.color}`} key={voucher.id}><div className="voucher-visual"><span>{voucher.icon}</span><small>FESTIVAL TICKET</small></div><div className="voucher-body"><span className={`status ${voucher.status}`}>{voucher.status === 'available' ? '교환 가능' : voucher.status === 'issued' ? '발급됨' : '사용 완료'}</span><h3>{voucher.name}</h3><p>{voucher.booth}</p><strong>{voucher.price} coin</strong>{voucher.status === 'available' && <button onClick={() => onExchange(voucher.id)}>승인 코인으로 발급 (데모)</button>}{voucher.status !== 'available' && <p className="helper">학생 화면에서는 상태만 확인합니다.</p>}</div></article>)}</div>
    </section>
  )
}

function AdminVoucherView({ vouchers, onUse }: { vouchers: Voucher[]; onUse: (id: number) => void }) {
  const issued = vouchers.filter((voucher) => voucher.status !== 'available')
  return (
    <section className="panel full-panel">
      <div className="section-title"><span className="title-icon yellow">◇</span><div><h2>QR 교환권 사용 처리</h2><p>학생이 발급한 교환권의 상태를 확인하는 기존 단순 데모입니다.</p></div></div>
      <div className="voucher-grid">{issued.map((voucher) => <article className={`voucher ${voucher.color}`} key={voucher.id}><div className="voucher-visual"><span>{voucher.icon}</span><small>QR DEMO</small></div><div className="voucher-body"><span className={`status ${voucher.status}`}>{voucher.status === 'issued' ? '발급됨' : '사용 완료'}</span><h3>{voucher.name}</h3><p>{voucher.booth}</p>{voucher.status === 'issued' ? <button onClick={() => onUse(voucher.id)}>사용 처리 (기존 데모)</button> : <button disabled>재사용 불가</button>}</div></article>)}</div>
      <div className="server-note"><strong>보안 기능 아님</strong><span>실제 QR 서명·만료·원자적 1회 사용 검증은 서버와 데이터베이스에서 구현해야 합니다.</span></div>
    </section>
  )
}

function StudentTaskRoadmap() {
  return <section className="learning-roadmap"><div><span className="eyebrow">STUDENT TODO</span><h2>신청부터 사용까지 우리가 직접 완성해요</h2><p><code>src/tasks/</code>와 <code>docs/STUDENT_TASKS.md</code>에서 Issue #4~#11 과제를 확인하세요.</p></div><div className="task-chips"><span>① 학번 검사</span><span>② pending 신청</span><span>③ 승인·잔액</span><span>④ 간식 선택</span><span>⑤ 교환권 발급</span><span>⑥ QR 사용</span><span>⑦ 랭킹</span><span>⑧ 상태 카드</span></div></section>
}

function RankingView() {
  const [filter, setFilter] = useState('전체')
  const filters = ['전체', '로봇 미로', '스피드 퍼즐', '세계 퀴즈']
  const visible = filter === '전체' ? RANKINGS : RANKINGS.filter((item) => item.game === filter)
  return <section className="panel full-panel ranking-panel"><div className="ranking-heading"><div className="section-title"><span className="title-icon mint">♛</span><div><h2>게임 랭킹</h2><p>코인 신청과 별도로 유지되는 가상 순위입니다.</p></div></div><div className="filters">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="podium">{RANKINGS.slice(0, 3).map((entry) => <div className={`podium-card rank-${entry.rank}`} key={entry.rank}><span>{entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}</span><strong>{entry.name}</strong><small>{entry.game}</small><b>{entry.score}{entry.unit}</b></div>)}</div><div className="ranking-table" role="table" aria-label="게임 순위"><div className="table-row table-head" role="row"><span>순위</span><span>팀</span><span>종목</span><span>기록</span></div>{visible.map((entry) => <div className="table-row" role="row" key={entry.rank}><strong>{entry.rank}</strong><span><b>{entry.name}</b><small>{entry.club}</small></span><span>{entry.game}</span><b>{entry.score}{entry.unit}</b></div>)}</div></section>
}

export default App


