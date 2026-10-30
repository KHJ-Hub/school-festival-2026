import { useState, type ReactNode } from 'react'
import {
  StudentVoucherCard,
  calculateCoinBalance,
  calculateTotalEarned,
  canAffordMenu,
  createCoinRequest,
  findDemoStudent,
  findEnabledMenu,
  isDemoStudentId,
  issueVoucher,
  markVoucherUsed,
  rankByTotalEarned,
  resolveCoinRequest,
} from '../studentTasks'
import type { CoinGrant, CoinRequest, TaskVoucher } from '../tasks/taskTypes'
import { DEMO_GRANTS, DEMO_MENUS, DEMO_REQUESTS, DEMO_STUDENTS, DEMO_VOUCHERS } from '../tasks/fixtures'
import type { AppMode } from './ModeSwitcher'
import './FestivalLive.css'

/**
 * 교사 관리 파일: 학생들이 만든 함수(src/tasks/)를 실제 화면 흐름에 연결합니다.
 * 학생 코드에서 오류가 나도 화면이 멈추지 않도록 호출마다 감쌉니다.
 * 아직 만들지 않은 기능은 "N번 학생이 만드는 중"으로 보여 줍니다.
 */
const NOT_BUILT = '아직 구현되지 않은 교육용 기능입니다.'

function safe<T>(run: () => T, fallback: T): T {
  try {
    return run()
  } catch {
    return fallback
  }
}

function maskId(studentId: string): string {
  return `${studentId.slice(0, 3)}**`
}

function Section({ no, title, desc, built = true, children }: { no: number; title: string; desc: string; built?: boolean; children: ReactNode }) {
  return (
    <article className="panel live-section">
      <div className="live-head">
        <div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
        <span className={`live-badge ${built ? 'done' : 'todo'}`}>{built ? `${no}번 학생이 만든 기능` : `${no}번 학생이 만드는 중`}</span>
      </div>
      {children}
    </article>
  )
}

export function FestivalLive({ mode }: { mode: AppMode }) {
  const [inputId, setInputId] = useState('90001')
  const [amount, setAmount] = useState(3)
  const [requests, setRequests] = useState<CoinRequest[]>(DEMO_REQUESTS)
  const [grants, setGrants] = useState<CoinGrant[]>(DEMO_GRANTS)
  const [vouchers, setVouchers] = useState<TaskVoucher[]>(DEMO_VOUCHERS)
  const [message, setMessage] = useState('')
  const [lastNotBuilt, setLastNotBuilt] = useState<Record<number, boolean>>({})

  const studentId = inputId.trim()
  const knownId = DEMO_STUDENTS.some((student) => student.studentId === studentId)
  const idCheck = safe(() => isDemoStudentId(studentId), false)
  const student = safe(() => findDemoStudent(DEMO_STUDENTS, studentId), undefined)
  const balance = safe(() => calculateCoinBalance(studentId, grants, vouchers), 0)
  const earned = safe(() => calculateTotalEarned(studentId, grants), 0)
  const ranking = safe(() => rankByTotalEarned(grants, 5), [])
  const myVouchers = vouchers.filter((voucher) => voucher.studentId === studentId)
  const pending = requests.filter((request) => request.status === 'pending')
  const issued = vouchers.filter((voucher) => voucher.status === 'issued')

  const report = (no: number, text: string, notBuilt: boolean) => {
    setMessage(text)
    setLastNotBuilt((current) => ({ ...current, [no]: notBuilt }))
  }

  const submitRequest = () => {
    const result = safe(() => createCoinRequest(requests, studentId, amount), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', requests })
    if (result.ok) setRequests(result.requests)
    report(2, result.message || (result.ok ? '신청했어요. 운영진 승인을 기다려요.' : ''), result.message === NOT_BUILT)
  }

  const exchange = (menuId: string) => {
    const menu = safe(() => findEnabledMenu(DEMO_MENUS, menuId), undefined)
    if (!menu) {
      report(1, '지금은 판매하지 않는 메뉴예요.', false)
      return
    }
    if (!safe(() => canAffordMenu(balance, menu), false)) {
      report(1, '코인이 부족해요.', false)
      return
    }
    const result = safe(() => issueVoucher(vouchers, studentId, menu, balance), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', vouchers })
    if (result.ok) setVouchers(result.vouchers)
    report(5, result.message || (result.ok ? `${menu.name} 교환권을 받았어요.` : ''), result.message === NOT_BUILT)
  }

  const decide = (requestId: string, decision: 'approve' | 'reject') => {
    const result = safe(() => resolveCoinRequest(requests, grants, requestId, decision), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', requests, grants })
    if (result.ok) {
      setRequests(result.requests)
      setGrants(result.grants)
    }
    report(4, result.message || (result.ok ? (decision === 'approve' ? '승인했어요.' : '거절했어요.') : ''), result.message === NOT_BUILT)
  }

  const useVoucher = (voucherId: string) => {
    const result = safe(() => markVoucherUsed(vouchers, voucherId), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', vouchers })
    if (result.ok) setVouchers(result.vouchers)
    report(6, result.message || (result.ok ? '사용 처리했어요.' : ''), result.message === NOT_BUILT)
  }

  const rankingSection = (
    <Section no={7} title="코인 랭킹" desc="지금까지 모은 코인이 많은 순서예요. 학번은 가려서 보여 줘요." built={ranking.length > 0}>
      {ranking.length === 0 ? (
        <p className="live-empty">7번 학생 코드가 순위를 만들면 여기에 나타나요.</p>
      ) : (
        <ol className="live-rank">
          {ranking.map((row) => <li key={row.rank}><b>{row.rank}위</b><span>{maskId(row.studentId)}</span><strong>{row.total} coin</strong></li>)}
        </ol>
      )}
    </Section>
  )

  return (
    <div className="live">
      <section className="panel live-id">
        <label>
          내 학번 (연습용 학번만: 90001, 90002, 90003)
          <input value={inputId} onChange={(event) => setInputId(event.target.value)} inputMode="numeric" maxLength={5} />
        </label>
        <div className="live-id-result">
          <span className={`live-badge ${student || idCheck ? 'done' : 'todo'}`}>{student || idCheck ? '1번 학생이 만든 기능' : '1번 학생이 만드는 중'}</span>
          {student ? <strong>{student.nickname}님, 반가워요!</strong> : idCheck ? <strong>5자리 학번이에요. 등록된 학생은 아니에요.</strong> : <strong>학번은 숫자 5자리예요.</strong>}
        </div>
      </section>

      {message && <div className={`live-message ${Object.values(lastNotBuilt).some(Boolean) ? 'todo' : ''}`} role="status">{message}</div>}

      {mode === 'student' && (
        <>
          <Section no={3} title="내 코인" desc="받은 코인과 지금 쓸 수 있는 코인이에요." built={earned > 0 || balance > 0 || !knownId}>
            <div className="live-numbers">
              <div><small>지금 쓸 수 있는 코인</small><strong>{balance} coin</strong></div>
              <div><small>지금까지 모은 코인</small><strong>{earned} coin</strong></div>
            </div>
            {knownId && earned === 0 && balance === 0 && <p className="live-empty">0이면 3번 학생 코드가 아직 계산하지 않는 거예요.</p>}
          </Section>

          <Section no={2} title="코인 적립 신청" desc="내가 가진 코인 수를 신청하면 운영진이 확인해요." built={!lastNotBuilt[2]}>
            <div className="live-row">
              <input type="number" min={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} aria-label="신청할 코인 수" />
              <button className="primary-button" onClick={submitRequest}>신청하기 <span>→</span></button>
            </div>
            <ul className="live-list">
              {requests.filter((request) => request.studentId === studentId).map((request) => (
                <li key={request.id}><span>{request.claimedAmount} coin 신청</span><b className={`live-status ${request.status}`}>{{ pending: '기다리는 중', approved: '승인됨', rejected: '거절됨' }[request.status]}</b></li>
              ))}
            </ul>
          </Section>

          <Section no={5} title="간식 교환" desc="모은 코인으로 팝콘 교환권을 받아요." built={!lastNotBuilt[5]}>
            <ul className="live-list">
              {DEMO_MENUS.map((menu) => (
                <li key={menu.id}>
                  <span>{menu.name} · {menu.cost} coin{!menu.enabled && ' (판매 중지)'}</span>
                  <button onClick={() => exchange(menu.id)}>교환하기</button>
                </li>
              ))}
            </ul>
          </Section>

          <Section no={8} title="내 모바일 교환권" desc="받은 교환권의 상태를 보여 줘요. 학생 화면에는 버튼이 없어요.">
            {myVouchers.length === 0 ? <p className="live-empty">아직 받은 교환권이 없어요.</p> : (
              <div className="live-cards">
                {myVouchers.map((voucher) => <StudentVoucherCard key={voucher.id} voucher={voucher} menuName={DEMO_MENUS.find((menu) => menu.id === voucher.menuId)?.name ?? '메뉴'} />)}
              </div>
            )}
          </Section>
        </>
      )}

      {mode === 'admin' && (
        <>
          <Section no={4} title="적립 신청 승인" desc="학생이 신청한 코인을 확인하고 승인하거나 거절해요." built={!lastNotBuilt[4]}>
            {pending.length === 0 ? <p className="live-empty">기다리는 신청이 없어요. 학생용 화면에서 신청해 보세요.</p> : (
              <ul className="live-list">
                {pending.map((request) => (
                  <li key={request.id}>
                    <span>{maskId(request.studentId)} · {request.claimedAmount} coin 신청</span>
                    <span className="live-buttons"><button onClick={() => decide(request.id, 'approve')}>승인</button><button className="ghost" onClick={() => decide(request.id, 'reject')}>거절</button></span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section no={6} title="교환권 사용 처리" desc="학생이 부스에서 교환권을 보여 주면 사용 처리해요." built={!lastNotBuilt[6]}>
            {issued.length === 0 ? <p className="live-empty">사용할 교환권이 없어요.</p> : (
              <ul className="live-list">
                {issued.map((voucher) => (
                  <li key={voucher.id}>
                    <span>{maskId(voucher.studentId)} · {DEMO_MENUS.find((menu) => menu.id === voucher.menuId)?.name ?? '메뉴'}</span>
                    <button onClick={() => useVoucher(voucher.id)}>사용 처리</button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}

      {rankingSection}
    </div>
  )
}
