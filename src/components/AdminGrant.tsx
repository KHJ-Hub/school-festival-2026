import { useEffect, useState } from 'react'
import { cancelDirectGrant, grantCoinsDirect, type DirectGrant } from '../data/store'
import type { Account, RosterEntry } from './nicknameRules'

/**
 * 교사 관리 파일: 운영진이 학번으로 코인을 바로 지급합니다(알바 보상 등).
 * 명단(또는 등록된 학생)에 있는 학번에게만 줄 수 있고, 지급 전에 이름을 확인합니다.
 * 직접 지급한 기록은 아래에 남고, 잘못 줬으면 "취소"로 지울 수 있습니다.
 */
export function AdminGrant({ roster, accounts, grants }: { roster: RosterEntry[]; accounts: Account[]; grants: DirectGrant[] }) {
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState(1)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  // 알림 문구는 4초 뒤 사라집니다(자리 차지하지 않게).
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const nameOf = (id: string) => roster.find((entry) => entry.studentId === id)?.name ?? accounts.find((account) => account.studentId === id)?.name

  const give = async () => {
    const id = studentId.trim()
    if (!/^\d{5}$/.test(id)) return setMessage('학번은 숫자 5자리로 써 주세요.')
    const name = nameOf(id)
    if (!name) return setMessage('명단에 없는 학번이에요. 학생 명단에 먼저 넣어 주세요.')
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) return setMessage('코인은 1~100 사이 정수로 써 주세요.')
    if (!window.confirm(`${id} ${name}에게 ${amount} coin을 지급할까요?`)) return
    try {
      await grantCoinsDirect(id, amount, note.trim())
    } catch {
      return setMessage('지급하지 못했어요. 인터넷 연결을 확인해 주세요.')
    }
    setMessage(`${name}에게 ${amount} coin을 지급했어요.`)
    setStudentId('')
    setAmount(1)
    setNote('')
  }

  const cancel = async (grant: DirectGrant) => {
    if (!window.confirm(`${grant.studentId} ${nameOf(grant.studentId) ?? ''}에게 준 ${grant.amount} coin 지급을 취소할까요?`)) return
    try {
      await cancelDirectGrant(grant.studentId, grant.id)
      setMessage('지급을 취소했어요.')
    } catch {
      setMessage('취소하지 못했어요. 인터넷 연결을 확인해 주세요.')
    }
  }

  const recent = grants
    .filter((grant) => grant.requestId === 'direct')
    .sort((a, b) => (b.at?.toMillis() ?? Number.MAX_SAFE_INTEGER) - (a.at?.toMillis() ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 5)

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>코인 직접 지급</h2>
          <p>학번으로 코인을 바로 줘요. 알바 보상처럼 신청 없이 줄 때 써요. 메모는 비워 둬도 돼요.</p>
        </div>
      </div>

      {message && <p className="live-message" role="status">{message}</p>}

      <div className="live-row">
        <input value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="학번" inputMode="numeric" maxLength={5} aria-label="지급할 학번" />
        <input type="number" min={1} max={100} value={amount} onChange={(event) => setAmount(Number(event.target.value))} aria-label="지급할 코인 수" />
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="메모 (선택)" maxLength={30} aria-label="메모" />
        <button className="primary-button" onClick={() => void give()}>지급하기</button>
      </div>

      {recent.length > 0 && (
        <>
          <h3>최근 직접 지급</h3>
          <ul className="live-list">
            {recent.map((grant) => (
              <li key={`${grant.studentId}-${grant.id}`}>
                <span>{grant.studentId} {nameOf(grant.studentId) ?? ''} · {grant.amount} coin{grant.note ? ` · ${grant.note}` : ''}</span>
                <button className="ghost" onClick={() => void cancel(grant)}>취소</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
