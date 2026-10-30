import { useEffect, useState, type ReactNode } from 'react'
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
import { DEMO_GRANTS, DEMO_MENUS, DEMO_REQUESTS, DEMO_STUDENTS, DEMO_VOUCHERS } from '../tasks/fixtures'
import type { SnackMenu } from '../tasks/taskTypes'
import {
  saveNewRequest,
  saveNewVoucher,
  saveRanking,
  saveResolution,
  saveVoucherUse,
  useAdminData,
  useMenus,
  useRanking,
  useRankingState,
  type StoredVoucher,
  useStudentData,
} from '../data/store'
import { creditLabel } from '../credits'
import { Barcode } from './Barcode'
import type { AppMode } from './ModeSwitcher'
import type { Account } from './nicknameRules'
import './FestivalLive.css'

/**
 * 교사 관리 파일: 학생들이 만든 함수(src/tasks/)를 실제 화면 흐름에 연결합니다.
 * 학생 함수의 계산 결과는 그대로 쓰고, 바뀐 부분만 Firestore에 저장합니다(src/data/store.ts).
 * 학생 코드에서 오류가 나도 화면이 멈추지 않도록 호출마다 감쌉니다.
 */
const NOT_BUILT = '아직 구현되지 않은 교육용 기능입니다.'
/** 학생 1명이 받을 수 있는 교환권 수(취소된 교환권은 세지 않음). 기획서: 모은 코인으로 메뉴 하나를 고르는 방식. */
const VOUCHERS_PER_STUDENT = 1

/**
 * 이름표("N번 학생이 만든 기능 / 만드는 중")를 정하려고, 화면을 열 때 연습 데이터로 학생 함수를 한 번씩 돌려 봅니다.
 * 테스트(src/tasks/__tests__)의 대표 경우 하나만 확인하므로, 정확한 채점은 npm test로 합니다.
 * 학생 코드가 연습 데이터를 고쳐도 다른 화면에 영향이 없게 복사본을 넘깁니다.
 */
function probeBuilt(): Record<number, boolean> {
  const copy = <T,>(value: T): T => structuredClone(value)
  const bag = DEMO_MENUS[1]!
  const card = safe(() => JSON.stringify(StudentVoucherCard({ voucher: copy(DEMO_VOUCHERS[0]!), menuName: '확인' })), '')
  return {
    1: safe(() => isDemoStudentId('90001') === true && findDemoStudent(copy(DEMO_STUDENTS), '90001')?.nickname === '별빛여우', false),
    2: safe(() => createCoinRequest(copy(DEMO_REQUESTS), '90001', 3).ok === true, false),
    3: safe(() => calculateTotalEarned('90001', copy(DEMO_GRANTS)) === 5, false),
    4: safe(() => resolveCoinRequest(copy(DEMO_REQUESTS), copy(DEMO_GRANTS), 'r-3', 'approve').ok === true, false),
    5: safe(() => issueVoucher(copy(DEMO_VOUCHERS), '90001', copy(bag), 5).ok === true, false),
    6: safe(() => markVoucherUsed(copy(DEMO_VOUCHERS), 'v-1').ok === true, false),
    7: safe(() => rankByTotalEarned(copy(DEMO_GRANTS), 5).length > 0, false),
    8: card !== '' && !card.includes('TODO'),
  }
}
const BUILT = probeBuilt()
const SAVE_FAILED = '저장하지 못했어요. 인터넷 연결을 확인하고 다시 해 주세요.'

function safe<T>(run: () => T, fallback: T): T {
  try {
    return run()
  } catch {
    return fallback
  }
}

/** 운영진 화면용: 중복 수령 확인을 위해 닉네임과 학번·이름을 함께 보여 줍니다. */
function adminLabel(studentId: string, accounts: Account[]): string {
  const account = accounts.find((item) => item.studentId === studentId)
  return account ? `${account.nickname} (${account.studentId} ${account.name})` : `${studentId} (미등록)`
}

/** 스캔(사용 처리) 시각: "10월 31일 14:05". 예전 교환권처럼 시각이 없으면 "시각 기록 없음". */
function scanTime(voucher: StoredVoucher): string {
  const date = voucher.usedAt?.toDate()
  if (!date) return '시각 기록 없음'
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

/** 교환권에 저장된 메뉴 이름을 먼저 쓰고(메뉴를 지워도 남음), 없으면 지금 메뉴 목록에서 찾습니다. */
function voucherMenuName(voucher: StoredVoucher, menus: SnackMenu[]): string {
  return voucher.menuName ?? menus.find((menu) => menu.id === voucher.menuId)?.name ?? '메뉴'
}

function Section({ no, title, desc, built = true, children }: { no: number; title: string; desc: string; built?: boolean; children: ReactNode }) {
  return (
    <article className="panel live-section">
      <div className="live-head">
        <div className="live-title-row">
          <h2>{title}</h2>
          <span className={`live-badge ${built ? 'done' : 'todo'}`}>{creditLabel(no, built)}</span>
        </div>
        <p>{desc}</p>
      </div>
      {children}
    </article>
  )
}

/** 학번·이름·닉네임 등록칸. 처음이면 등록, 이미 등록한 학번이면 다시 들어오기로 처리합니다(App이 판단). */
export function StudentIdBox({ me, busy, onEnter, onRename, onLeave }: {
  me: Account | null
  busy: boolean
  onEnter: (input: { studentId: string; name: string; nickname: string }) => Promise<string | null>
  onRename: (nickname: string) => Promise<string | null>
  onLeave: () => void
}) {
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [newNick, setNewNick] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  // 1번 학생 함수가 만들어졌는지: 올바른 연습 학번을 넣어 보고 확인합니다.
  const built = BUILT[1]!

  const submit = async () => {
    setWorking(true)
    const problem = await onEnter({ studentId, name, nickname })
    setWorking(false)
    setError(problem ?? '')
    if (!problem) {
      setStudentId('')
      setName('')
      setNickname('')
    }
  }

  const rename = async () => {
    setWorking(true)
    const problem = await onRename(newNick)
    setWorking(false)
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
            <button className="live-reset" onClick={() => void rename()} disabled={working}>{working ? '바꾸는 중…' : '바꾸기'}</button>
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
      <div className="live-head">
        <div className="live-title-row">
          <h2>학생 등록</h2>
          <span className={`live-badge ${built ? 'done' : 'todo'}`}>{creditLabel(1, built)}</span>
        </div>
      </div>
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
        <button className="primary-button" onClick={() => void submit()} disabled={busy || working}>{busy ? '연결 중…' : working ? '확인 중…' : '등록 / 다시 들어오기'} <span>→</span></button>
      </div>
      <p className="live-empty">이미 등록했다면 학번과 이름만 쓰고 누르면 다시 들어와요.</p>
      {error && <p className="live-error" role="alert">{error}</p>}
    </section>
  )
}

export function FestivalLive({ mode, me, isAdmin }: { mode: AppMode; me: Account | null; isAdmin: boolean }) {
  const studentId = me?.studentId ?? ''
  const mine = useStudentData(studentId || null)
  const all = useAdminData(isAdmin)
  const { menus } = useMenus()
  const [amount, setAmount] = useState(3)
  const [message, setMessage] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [lastNotBuilt, setLastNotBuilt] = useState<Record<number, boolean>>({})

  const balance = safe(() => calculateCoinBalance(studentId, mine.grants, mine.vouchers), 0)
  // 취소되지 않은 교환권이 이미 한 장 있으면 더 바꿀 수 없습니다.
  const exchangedAll = mine.vouchers.filter((voucher) => voucher.status !== 'cancelled').length >= VOUCHERS_PER_STUDENT
  const earned = safe(() => calculateTotalEarned(studentId, mine.grants), 0)
  const pending = all.requests.filter((request) => request.status === 'pending')
  const issued = all.vouchers.filter((voucher) => voucher.status === 'issued')
  // 최근에 사용 처리한 순서(시간 기록이 없는 예전 교환권은 맨 뒤)
  const used = all.vouchers
    .filter((voucher) => voucher.status === 'used')
    .sort((a, b) => (b.usedAt?.toMillis() ?? 0) - (a.usedAt?.toMillis() ?? 0))

  const report = (no: number, text: string, notBuilt: boolean) => {
    setMessage(text)
    setLastNotBuilt((current) => ({ ...current, [no]: notBuilt }))
  }

  const submitRequest = async () => {
    const result = safe(() => createCoinRequest(mine.requests, studentId, amount), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', requests: mine.requests })
    const created = result.ok ? result.requests.find((request) => !mine.requests.some((old) => old.id === request.id)) : undefined
    if (created) {
      try {
        await saveNewRequest(studentId, created)
      } catch {
        return report(2, SAVE_FAILED, false)
      }
    }
    report(2, result.message || (result.ok ? '신청했어요. 운영진에게 실물 코인을 내고 승인을 기다려요.' : ''), result.message === NOT_BUILT)
  }

  const exchange = async (menuId: string) => {
    if (exchangedAll) return report(5, '교환권은 한 사람당 한 번만 받을 수 있어요.', false)
    const menu = safe(() => findEnabledMenu(menus, menuId), undefined)
    if (!menu) return report(1, '품절된 메뉴예요. 다른 메뉴를 골라 주세요.', false)
    if (!safe(() => canAffordMenu(balance, menu), false)) return report(1, '코인이 부족해요.', false)
    const result = safe(() => issueVoucher(mine.vouchers, studentId, menu, balance), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', vouchers: mine.vouchers })
    const created = result.ok ? result.vouchers.find((voucher) => !mine.vouchers.some((old) => old.id === voucher.id)) : undefined
    if (created) {
      try {
        await saveNewVoucher(studentId, created, menu.name)
      } catch {
        return report(5, SAVE_FAILED, false)
      }
    }
    report(5, result.message || (result.ok ? `${menu.name} 교환권을 받았어요.` : ''), result.message === NOT_BUILT)
  }

  const decide = async (requestId: string, decision: 'approve' | 'reject') => {
    const before = { requests: all.requests, grants: all.grants }
    const result = safe(() => resolveCoinRequest(all.requests, all.grants, requestId, decision), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', requests: all.requests, grants: all.grants })
    if (result.ok) {
      try {
        await saveResolution(before, { requests: result.requests, grants: result.grants })
      } catch {
        return report(4, SAVE_FAILED, false)
      }
    }
    report(4, result.message || (result.ok ? (decision === 'approve' ? '승인했어요.' : '거절했어요.') : ''), result.message === NOT_BUILT)
  }

  /** 바코드 스캐너가 읽은 값(또는 직접 입력한 코드)으로 교환권을 찾아 자동으로 사용 처리합니다. */
  const scanVoucher = async (code: string) => {
    const voucherId = code.trim().toUpperCase()
    setScanCode('')
    if (!all.vouchers.some((voucher) => voucher.id === voucherId)) return report(6, `"${code.trim()}"는 없는 교환권이에요. 다시 스캔해 주세요.`, false)
    const result = safe(() => markVoucherUsed(all.vouchers, voucherId), { ok: false, message: '오류가 났어요. 코드를 확인해 보세요.', vouchers: all.vouchers })
    if (result.ok) {
      try {
        await saveVoucherUse(all.vouchers, result.vouchers)
      } catch {
        return report(6, SAVE_FAILED, false)
      }
    }
    report(6, result.message || (result.ok ? '스캔 완료! 사용 처리됐어요.' : ''), result.message === NOT_BUILT)
  }

  return (
    <div className="live">
      {message && <div className={`live-message ${Object.values(lastNotBuilt).some(Boolean) ? 'todo' : ''}`} role="status">{message}</div>}

      {mode === 'student' && !studentId && (
        <div className="live-message" role="status">위에서 학번·이름·닉네임으로 등록하면 코인 신청을 시작할 수 있어요.</div>
      )}

      {mode === 'student' && studentId && (
        <>
          <Section no={2} title="코인 적립 신청" desc="받은 실물 코인 수를 신청하면 운영진이 코인을 회수하고 승인해요." built={BUILT[2]}>
            <div className="live-row">
              <input type="number" min={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} aria-label="신청할 코인 수" />
              <button className="primary-button" onClick={() => void submitRequest()}>신청하기 <span>→</span></button>
            </div>
            <ul className="live-list one-line">
              {mine.requests.map((request) => (
                <li key={request.id}><span>{request.claimedAmount} coin 신청</span><b className={`live-status ${request.status}`}>{{ pending: '기다리는 중', approved: `승인됨${request.approvedAmount !== undefined && request.approvedAmount !== request.claimedAmount ? ` (${request.approvedAmount} coin)` : ''}`, rejected: '거절됨' }[request.status]}</b></li>
              ))}
            </ul>
          </Section>

          <Section no={3} title="내 코인" desc={exchangedAll ? '교환을 마쳤어요. 모은 코인은 랭킹 점수로 남아요.' : '교환에 쓸 수 있는 코인과 지금까지 모은 코인이에요.'} built={BUILT[3]}>
            <div className="live-numbers">
              {/* 교환은 한 번뿐이라, 교환한 뒤에는 남은 코인 대신 "교환 완료"를 보여 줍니다. */}
              {exchangedAll
                ? <div className="done"><small>간식 교환</small><strong>교환 완료 ✓</strong></div>
                : <div><small>교환에 쓸 수 있는 코인</small><strong>{balance} coin</strong></div>}
              <div><small>지금까지 모은 코인</small><strong>{earned} coin</strong></div>
            </div>
          </Section>

          <Section no={5} title="간식 교환" desc="모은 코인으로 원하는 간식 하나를 골라요. 교환은 한 번만 할 수 있어요." built={BUILT[5]}>
            {exchangedAll && <p className="live-message">교환을 마쳤어요. 아래 교환권을 부스에서 보여 주세요.</p>}
            <ul className="live-list">
              {menus.map((menu) => (
                <li key={menu.id} className={menu.enabled ? '' : 'sold-out'}>
                  <span>{menu.name} · {menu.cost} coin</span>
                  {!menu.enabled ? <button disabled>품절</button> : exchangedAll ? <button disabled>교환 완료</button> : <button onClick={() => void exchange(menu.id)}>교환하기</button>}
                </li>
              ))}
              {menus.length === 0 && <li><span>아직 메뉴가 없어요.</span></li>}
            </ul>
          </Section>

          <Section no={8} title="내 모바일 교환권" desc="부스에서 바코드를 보여 주면 운영진이 스캔해요." built={BUILT[8]}>
            {mine.vouchers.length === 0 ? <p className="live-empty">아직 받은 교환권이 없어요.</p> : (
              <div className="live-cards">
                {mine.vouchers.map((voucher) => (
                  <div key={voucher.id} className={`gifticon ${voucher.status}`}>
                    <StudentVoucherCard voucher={voucher} menuName={voucherMenuName(voucher, menus)} />
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

      {mode === 'admin' && isAdmin && (
        <>
          <Section no={4} title="적립 신청 승인" desc="실물 코인을 회수한 뒤 승인해요. 학번·이름으로 중복 수령을 확인하세요." built={BUILT[4]}>
            {pending.length === 0 ? <p className="live-empty">기다리는 신청이 없어요.</p> : (
              <ul className="live-list">
                {pending.map((request) => (
                  <li key={request.id}>
                    <span>{adminLabel(request.studentId, all.accounts)} · {request.claimedAmount} coin 신청</span>
                    <span className="live-buttons"><button onClick={() => void decide(request.id, 'approve')}>승인</button><button className="ghost" onClick={() => void decide(request.id, 'reject')}>거절</button></span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section no={6} title="교환권 바코드 스캔" desc="손님 폰의 바코드를 스캔하면 자동으로 사용 처리돼요. 스캐너가 없으면 코드를 직접 입력해도 돼요." built={BUILT[6]}>
            <form className="live-row" onSubmit={(event) => { event.preventDefault(); if (scanCode.trim()) void scanVoucher(scanCode) }}>
              <input value={scanCode} onChange={(event) => setScanCode(event.target.value)} placeholder="여기에 스캔 (예: K7F2Q9AB)" aria-label="교환권 바코드 값" autoComplete="off" />
              <button className="primary-button" type="submit">스캔 <span>→</span></button>
            </form>
            <p className="live-empty">바코드 스캐너는 읽은 값을 이 칸에 입력하고 Enter를 눌러 줘요.</p>
            {/* 사용 처리는 바코드 스캔이나 코드 입력으로만 합니다(목록에서 눌러서 쓰는 버튼 없음). */}
            <details className="live-fold">
              <summary>아직 안 쓴 교환권 {issued.length}장</summary>
              {issued.length === 0 ? <p className="live-empty">모두 사용했어요.</p> : (
                <ul className="live-list">
                  {issued.map((voucher) => (
                    <li key={voucher.id}><span>{adminLabel(voucher.studentId, all.accounts)} · {voucherMenuName(voucher, menus)} · <code>{voucher.id}</code></span></li>
                  ))}
                </ul>
              )}
            </details>
            <details className="live-fold">
              <summary>최근 스캔 기록 (사용 완료 {used.length}장)</summary>
              {used.length === 0 ? <p className="live-empty">아직 사용한 교환권이 없어요.</p> : (
                <ul className="live-list scan-log">
                  {used.slice(0, 30).map((voucher) => (
                    <li key={voucher.id}>
                      <b>{scanTime(voucher)}</b>
                      <span>{adminLabel(voucher.studentId, all.accounts)} · {voucherMenuName(voucher, menus)} · <code>{voucher.id}</code></span>
                    </li>
                  ))}
                </ul>
              )}
              {used.length > 30 && <p className="live-empty">최근 30장만 보여 줘요.</p>}
            </details>
          </Section>
        </>
      )}

    </div>
  )
}

/**
 * 랭킹 전용 화면(교실 TV·모니터용). 운영진 화면이 계산해 저장한 랭킹(닉네임·코인만)을 실시간으로 보여 줍니다.
 * 주소 끝에 #ranking 을 붙이면 바로 이 화면으로 열립니다.
 */
export function RankingBoard() {
  const ranking = useRanking()
  const built = BUILT[7]!
  const [first, second, third, ...rest] = ranking
  // 가운데가 1위가 되도록 [2위, 1위, 3위] 자리를 고정하고, 비어 있는 자리는 빈칸으로 둡니다.
  const podium = [second, first, third]

  return (
    <section className="board">
      <div className="board-head">
        <div>
          <h2>코인 랭킹 TOP 10</h2>
          <p>지금까지 모은 코인 순위예요. 1위는 시크릿 박스에 도전!</p>
        </div>
        <div className="board-tags">
          <span className="board-live"><i aria-hidden="true" /> 실시간</span>
          <span className={`live-badge ${built ? 'done' : 'todo'}`}>{creditLabel(7, built)}</span>
        </div>
      </div>

      {ranking.length === 0 ? (
        <p className="board-empty">{built ? '아직 승인된 코인이 없어요. 첫 번째 주인공이 되어 보세요!' : '7번 학생 코드가 순위를 만들면 여기에 나타나요.'}</p>
      ) : (
        <>
          <ol className="board-podium">
            {podium.map((row, index) => row ? (
              <li key={row.rank} className={`rank-${row.rank}`}>
                <span className="board-medal" aria-hidden="true">{row.rank === 1 ? '👑' : row.rank === 2 ? '🥈' : '🥉'}</span>
                <b>{row.rank}위</b>
                <strong>{row.nickname}</strong>
                <em>{row.total} coin</em>
              </li>
            ) : <li key={`empty-${index}`} className="empty" aria-hidden="true" />)}
          </ol>
          {rest.length > 0 && (
            <ol className="board-list">
              {rest.map((row) => <li key={row.rank}><b>{row.rank}위</b><span>{row.nickname}</span><strong>{row.total} coin</strong></li>)}
            </ol>
          )}
        </>
      )}
    </section>
  )
}

/**
 * 운영진으로 로그인한 기기가 있으면(어느 화면이든) 지급 내역이 바뀔 때마다
 * 7번 학생 함수로 랭킹을 다시 계산해 닉네임·코인만 공개 랭킹에 저장합니다. 화면에는 아무것도 그리지 않습니다.
 */
export function AdminRankingSync() {
  const all = useAdminData(true)
  const { rows: ranking, loaded } = useRankingState()
  useEffect(() => {
    // 덮어쓰기 사고 막기: ① 지급 내역·계정·랭킹을 서버에서 다 읽기 전, ② 7번 학생 함수가 아직 없는 화면(예: 학생 코드가 안 합쳐진 시험 화면)에서는 저장하지 않습니다.
    if (!all.grantsLoaded || !all.accountsLoaded || !loaded) return
    if (!safe(() => rankByTotalEarned(DEMO_GRANTS, 5).length > 0, false)) return
    const rows = safe(() => rankByTotalEarned(all.grants, 10), []).map((row) => ({
      rank: row.rank,
      nickname: all.accounts.find((account) => account.studentId === row.studentId)?.nickname ?? '닉네임 없음',
      total: row.total,
    }))
    if (JSON.stringify(rows) !== JSON.stringify(ranking)) void saveRanking(rows).catch(() => undefined)
  }, [all.grants, all.accounts, all.grantsLoaded, all.accountsLoaded, ranking, loaded])
  return null
}
