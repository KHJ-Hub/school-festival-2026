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
import { Barcode } from './Barcode'
import type { Account } from './nicknameRules'
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

/** 학생 화면·랭킹용: 닉네임만 보여 줍니다(학번·이름은 숨김). */
function nicknameOf(studentId: string, accounts: Account[]): string {
  return accounts.find((account) => account.studentId === studentId)?.nickname ?? '닉네임 없음'
}

/** 운영진 화면용: 중복 수령 확인을 위해 닉네임과 학번·이름을 함께 보여 줍니다. */
function adminLabel(studentId: string, accounts: Account[]): string {
  const account = accounts.find((item) => item.studentId === studentId)
  return account ? `${account.nickname} (${account.studentId} ${account.name})` : `${studentId} (미등록)`
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

/** 학번·이름·닉네임 등록칸. 처음이면 등록, 이미 등록한 학번이면 다시 들어오기로 처리합니다(App이 판단). */
export function StudentIdBox({ me, onEnter, onRename, onLeave }: {
  me: Account | null
  onEnter: (input: { studentId: string; name: string; nickname: string }) => string | null
  onRename: (nickname: string) => string | null
  onLeave: () => void
}) {
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [newNick, setNewNick] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  // 1번 학생 함수가 만들어졌는지: 올바른 연습 학번을 넣어 보고 확인합니다(입력칸이 비어 있어도 정확히 표시).
  const built = safe(() => isDemoStudentId('90001'), false) || Boolean(safe(() => findDemoStudent(DEMO_STUDENTS, '90001'), undefined))

  const submit = () => {
    const problem = onEnter({ studentId, name, nickname })
    setError(problem ?? '')
    if (!problem) {
      setStudentId('')
      setName('')
      setNickname('')
    }
  }

  const rename = () => {
    const problem = onRename(newNick)
    setError(problem ?? '')
    if (!problem) {
      setRenaming(false)
      setDone('닉네임을 바꿨어요.')
    }
  }

  if (me) {
    return (
      <section className="panel live-id registered">
        <div className="live-registered">
          <span className="live-check" aria-hidden="true">✓</span>
          <div>
            <strong>{me.nickname}님, 반가워요!</strong>
            <small>{done || '아래에서 코인 신청을 시작해 보세요.'}</small>
          </div>
        </div>
        {renaming ? (
          <div className="live-row">
            <input value={newNick} onChange={(event) => setNewNick(event.target.value)} maxLength={12} placeholder="새 닉네임" aria-label="새 닉네임" />
            <button className="live-reset" onClick={rename}>바꾸기</button>
            <button className="live-reset" onClick={() => { setRenaming(false); setError('') }}>취소</button>
          </div>
        ) : (
          <div className="live-buttons">
            <button className="live-reset" onClick={() => { setNewNick(me.nickname); setRenaming(true); setDone('') }}>닉네임 바꾸기</button>
            <button className="live-reset" onClick={() => { setError(''); setDone(''); onLeave() }}>나가기</button>
          </div>
        )}
        {error && <p className="live-error" role="alert">{error}</p>}
      </section>
    )
  }

  return (
    <section className="panel live-id">
      <div className="live-id-fields">
        <label>
          학번 (숫자 5자리)
          <input value={studentId} onChange={(event) => setStudentId(event.target.value)} inputMode="numeric" maxLength={5} />
        </label>
        <label>
          이름 (명단 확인용 · 화면에는 안 나와요)
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} />
        </label>
        <label>
          닉네임 (랭킹에 이 이름으로 나와요 · 처음 등록할 때만)
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={12} placeholder="예: 별빛여우" />
        </label>
      </div>
      <div className="live-id-action">
        <button className="primary-button" onClick={submit}>등록 / 다시 들어오기 <span>→</span></button>
        <span className={`live-badge ${built ? 'done' : 'todo'}`}>{built ? '학번 확인: 1번 학생이 만든 기능' : '학번 확인: 1번 학생이 만드는 중'}</span>
      </div>
      <p className="live-empty">이미 등록했다면 학번과 이름만 쓰고 누르면 다시 들어와요.</p>
      {error && <p className="live-error" role="alert">{error}</p>}
    </section>
  )
}

export function FestivalLive({ mode, studentId, accounts }: { mode: AppMode; studentId: string; accounts: Account[] }) {
  const [amount, setAmount] = useState(3)
  const [requests, setRequests] = useState<CoinRequest[]>(DEMO_REQUESTS)
  const [grants, setGrants] = useState<CoinGrant[]>(DEMO_GRANTS)
  const [vouchers, setVouchers] = useState<TaskVoucher[]>(DEMO_VOUCHERS)
  const [message, setMessage] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [lastNotBuilt, setLastNotBuilt] = useState<Record<number, boolean>>({})

  const knownId = DEMO_STUDENTS.some((student) => student.studentId === studentId)
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

  /** 바코드 스캐너가 읽은 값(또는 직접 입력한 코드)으로 교환권을 찾아 자동으로 사용 처리합니다. */
  const scanVoucher = (code: string) => {
    const voucherId = code.trim().toLowerCase()
    setScanCode('')
    if (!vouchers.some((voucher) => voucher.id === voucherId)) {
      report(6, `"${code.trim()}"는 없는 교환권이에요. 다시 스캔해 주세요.`, false)
      return
    }
    const result = safe(() => markVoucherUsed(vouchers, voucherId), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', vouchers })
    if (result.ok) setVouchers(result.vouchers)
    report(6, result.message || (result.ok ? '스캔 완료! 사용 처리됐어요.' : ''), result.message === NOT_BUILT)
  }

  const rankingSection = (
    <Section no={7} title="코인 랭킹" desc="지금까지 모은 코인이 많은 순서예요. 닉네임만 보여 줘요." built={ranking.length > 0}>
      {ranking.length === 0 ? (
        <p className="live-empty">7번 학생 코드가 순위를 만들면 여기에 나타나요.</p>
      ) : (
        <ol className="live-rank">
          {ranking.map((row) => <li key={row.rank}><b>{row.rank}위</b><span>{nicknameOf(row.studentId, accounts)}</span><strong>{row.total} coin</strong></li>)}
        </ol>
      )}
    </Section>
  )

  return (
    <div className="live">
      {message && <div className={`live-message ${Object.values(lastNotBuilt).some(Boolean) ? 'todo' : ''}`} role="status">{message}</div>}

      {mode === 'student' && !studentId && (
        <div className="live-message" role="status">위에서 학번·이름·닉네임으로 등록하면 코인 신청을 시작할 수 있어요.</div>
      )}

      {mode === 'student' && studentId && (
        <>
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

          <Section no={3} title="내 코인" desc="받은 코인과 지금 쓸 수 있는 코인이에요." built={earned > 0 || balance > 0 || !knownId}>
            <div className="live-numbers">
              <div><small>지금 쓸 수 있는 코인</small><strong>{balance} coin</strong></div>
              <div><small>지금까지 모은 코인</small><strong>{earned} coin</strong></div>
            </div>
            {knownId && earned === 0 && balance === 0 && <p className="live-empty">0이면 3번 학생 코드가 아직 계산하지 않는 거예요.</p>}
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
                {myVouchers.map((voucher) => (
                  <div key={voucher.id} className={`gifticon ${voucher.status}`}>
                    <StudentVoucherCard voucher={voucher} menuName={DEMO_MENUS.find((menu) => menu.id === voucher.menuId)?.name ?? '메뉴'} />
                    <div className="gifticon-code">
                      <Barcode value={voucher.id} />
                      <small>{voucher.id}</small>
                      <span>{voucher.status === 'issued' ? '부스에서 이 바코드를 보여 주세요' : voucher.status === 'used' ? '이미 사용한 교환권이에요' : '취소된 교환권이에요'}</span>
                    </div>
                  </div>
                ))}
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
                    <span>{adminLabel(request.studentId, accounts)} · {request.claimedAmount} coin 신청</span>
                    <span className="live-buttons"><button onClick={() => decide(request.id, 'approve')}>승인</button><button className="ghost" onClick={() => decide(request.id, 'reject')}>거절</button></span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section no={6} title="교환권 바코드 스캔" desc="손님 폰의 바코드를 스캔하면 자동으로 사용 처리돼요. 스캐너가 없으면 코드를 직접 입력해도 돼요." built={!lastNotBuilt[6]}>
            <form className="live-row" onSubmit={(event) => { event.preventDefault(); if (scanCode.trim()) scanVoucher(scanCode) }}>
              <input value={scanCode} onChange={(event) => setScanCode(event.target.value)} placeholder="여기에 스캔 (예: v-1)" aria-label="교환권 바코드 값" autoComplete="off" />
              <button className="primary-button" type="submit">스캔 <span>→</span></button>
            </form>
            <p className="live-empty">바코드 스캐너는 읽은 값을 이 칸에 입력하고 Enter를 눌러 줘요.</p>
            {issued.length > 0 && (
              <ul className="live-list">
                {issued.map((voucher) => (
                  <li key={voucher.id}>
                    <span>{adminLabel(voucher.studentId, accounts)} · {DEMO_MENUS.find((menu) => menu.id === voucher.menuId)?.name ?? '메뉴'} · <code>{voucher.id}</code></span>
                    <button onClick={() => scanVoucher(voucher.id)}>스캔해 보기</button>
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
