import { useMemo, useState } from 'react'
import { BOOTHS, CLUBS, INITIAL_ACTIVITIES, INITIAL_VOUCHERS, RANKINGS } from './mockData'
import type { Activity, View, Voucher } from './types'

const NAV_ITEMS: Array<{ id: View; label: string; icon: string }> = [
  { id: 'coins', label: '코인 등록', icon: '✦' },
  { id: 'vouchers', label: '교환권', icon: '◇' },
  { id: 'ranking', label: '게임 랭킹', icon: '♛' },
]

function App() {
  const [view, setView] = useState<View>('coins')
  const [coins, setCoins] = useState(120)
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES)
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS)
  const [notice, setNotice] = useState('')

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const addCoins = (booth: string, amount: number) => {
    const activity: Activity = {
      id: Date.now(),
      booth,
      amount,
      time: new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    }
    setCoins((current) => current + amount)
    setActivities((current) => [activity, ...current])
    showNotice(`${amount}코인이 등록되었습니다. (데모)`)
  }

  const exchangeVoucher = (id: number) => {
    const voucher = vouchers.find((item) => item.id === id)
    if (!voucher || voucher.status !== 'available') return
    if (coins < voucher.price) {
      showNotice('코인이 부족합니다.')
      return
    }
    setCoins((current) => current - voucher.price)
    setVouchers((current) => current.map((item) => (
      item.id === id ? { ...item, status: 'issued' } : item
    )))
    showNotice(`${voucher.name}을 발급했습니다. (데모)`)
  }

  const useVoucher = (id: number) => {
    setVouchers((current) => current.map((item) => (
      item.id === id && item.status === 'issued' ? { ...item, status: 'used' } : item
    )))
    showNotice('사용 처리되었습니다. 실제 중복 검증은 서버 연결 후 적용됩니다.')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('coins')} aria-label="첫 화면으로 이동">
          <span className="brand-mark">F!</span>
          <span>
            <strong>모여라! 축제 연구소</strong>
            <small>2026 연합 동아리 프로젝트</small>
          </span>
        </button>
        <div className="festival-date"><span>축제까지</span><strong>12월 29일</strong></div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">우리 손으로 만드는 축제</p>
            <h1>놀고, 모으고,<br /><em>함께 기록해요.</em></h1>
            <p className="hero-copy">세 동아리가 준비하는 코인·교환권·게임 랭킹 체험 공간입니다.</p>
          </div>
          <div className="coin-card" aria-label={`현재 보유 코인 ${coins}`}>
            <span className="coin-symbol">F</span>
            <div><small>나의 축제 코인</small><strong>{coins}<span> coin</span></strong></div>
            <span className="demo-chip">DEMO</span>
          </div>
        </section>

        <div className="demo-alert" role="note">
          <span>ⓘ</span>
          <p><strong>가상 데이터로 연습 중이에요.</strong> 이름·학번 같은 개인정보는 입력하지 않습니다. 새로고침하면 처음 상태로 돌아갑니다.</p>
        </div>

        <nav className="tabs" aria-label="주요 화면">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {view === 'coins' && <CoinView activities={activities} onAdd={addCoins} />}
        {view === 'vouchers' && <VoucherView vouchers={vouchers} onExchange={exchangeVoucher} onUse={useVoucher} />}
        {view === 'ranking' && <RankingView />}

        <section className="clubs">
          <span>함께 만드는 동아리</span>
          <div>{CLUBS.map((club, index) => <span key={club}><i>{['♟', '⚙', '◎'][index]}</i>{club}</span>)}</div>
        </section>
      </main>

      <footer>
        <span>2026 학교 축제 프로젝트</span>
        <span>실습용 프론트엔드 · 서버 연결 전</span>
      </footer>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

function CoinView({ activities, onAdd }: { activities: Activity[]; onAdd: (booth: string, amount: number) => void }) {
  const [booth, setBooth] = useState(BOOTHS[0] ?? '')
  const [amount, setAmount] = useState(10)
  const total = useMemo(() => activities.reduce((sum, item) => sum + item.amount, 0), [activities])

  return (
    <section className="content-grid">
      <article className="panel register-panel">
        <div className="section-title"><span className="title-icon coral">＋</span><div><h2>코인 등록</h2><p>부스 체험을 마치고 받은 코인을 기록해 보세요.</p></div></div>
        <label>체험한 부스<select value={booth} onChange={(event) => setBooth(event.target.value)}>{BOOTHS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <fieldset><legend>받은 코인</legend><div className="amount-options">{[10, 20, 30].map((value) => <button key={value} className={amount === value ? 'selected' : ''} onClick={() => setAmount(value)}><strong>+{value}</strong><span>coin</span></button>)}</div></fieldset>
        <button className="primary-button" onClick={() => onAdd(booth, amount)}>코인 등록하기 <span>→</span></button>
        <p className="helper">※ 실제 운영 시에는 담당자 인증과 서버 저장이 필요합니다.</p>
      </article>

      <article className="panel history-panel">
        <div className="section-title compact"><div><h2>오늘의 기록</h2><p>가상 체험 내역 {activities.length}건 · 총 {total}코인</p></div><span className="live-dot">DEMO</span></div>
        <div className="activity-list">{activities.slice(0, 5).map((activity) => <div className="activity" key={activity.id}><span className="activity-icon">✓</span><div><strong>{activity.booth}</strong><small>{activity.time}</small></div><b>+{activity.amount}</b></div>)}</div>
      </article>
    </section>
  )
}

function VoucherView({ vouchers, onExchange, onUse }: { vouchers: Voucher[]; onExchange: (id: number) => void; onUse: (id: number) => void }) {
  return (
    <section className="panel full-panel">
      <div className="section-title"><span className="title-icon yellow">◇</span><div><h2>모바일 교환권</h2><p>모은 코인을 교환권으로 바꾸는 흐름을 연습합니다.</p></div></div>
      <div className="voucher-grid">{vouchers.map((voucher) => <article className={`voucher ${voucher.color}`} key={voucher.id}><div className="voucher-visual"><span>{voucher.icon}</span><small>FESTIVAL TICKET</small></div><div className="voucher-body"><span className={`status ${voucher.status}`}>{voucher.status === 'available' ? '교환 가능' : voucher.status === 'issued' ? '발급됨' : '사용 완료'}</span><h3>{voucher.name}</h3><p>{voucher.booth}</p><strong>{voucher.price} coin</strong>{voucher.status === 'available' && <button onClick={() => onExchange(voucher.id)}>교환하기</button>}{voucher.status === 'issued' && <button onClick={() => onUse(voucher.id)}>사용 처리 (데모)</button>}{voucher.status === 'used' && <button disabled>사용 완료</button>}</div></article>)}</div>
      <div className="server-note"><strong>서버 연동 예정</strong><span>실제 QR 발급, 1회 사용 보장, 동시 요청 방지, 관리자 취소 기능은 백엔드에서 검증해야 합니다.</span></div>
    </section>
  )
}

function RankingView() {
  const [filter, setFilter] = useState('전체')
  const filters = ['전체', '로봇 미로', '스피드 퍼즐', '세계 퀴즈']
  const visible = filter === '전체' ? RANKINGS : RANKINGS.filter((item) => item.game === filter)
  return (
    <section className="panel full-panel ranking-panel">
      <div className="ranking-heading"><div className="section-title"><span className="title-icon mint">♛</span><div><h2>게임 랭킹</h2><p>팀 별명으로만 표시한 가상 순위입니다.</p></div></div><div className="filters">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="podium">{RANKINGS.slice(0, 3).map((entry) => <div className={`podium-card rank-${entry.rank}`} key={entry.rank}><span>{entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}</span><strong>{entry.name}</strong><small>{entry.game}</small><b>{entry.score}{entry.unit}</b></div>)}</div>
      <div className="ranking-table" role="table" aria-label="게임 순위"><div className="table-row table-head" role="row"><span>순위</span><span>팀</span><span>종목</span><span>기록</span></div>{visible.map((entry) => <div className="table-row" role="row" key={entry.rank}><strong>{entry.rank}</strong><span><b>{entry.name}</b><small>{entry.club}</small></span><span>{entry.game}</span><b>{entry.score}{entry.unit}</b></div>)}</div>
    </section>
  )
}

export default App


