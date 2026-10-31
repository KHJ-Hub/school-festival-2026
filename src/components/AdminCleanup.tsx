import { useEffect, useState } from 'react'
import { removeStudentRecords } from '../data/store'
import type { Account, RosterEntry } from './nicknameRules'

/** "90001~90003", "90001-90003", "90001 90005" 같은 입력을 학번 목록으로 바꿉니다. 형식이 틀리면 null. */
function parseIds(text: string): string[] | null {
  const ids: string[] = []
  for (const part of text.split(/[\s,]+/).filter(Boolean)) {
    const range = part.match(/^(\d{5})[~-](\d{5})$/)
    if (range) {
      const from = Number(range[1])
      const to = Number(range[2])
      if (to < from || to - from > 50) return null
      for (let id = from; id <= to; id += 1) ids.push(String(id))
    } else if (/^\d{5}$/.test(part)) {
      ids.push(part)
    } else {
      return null
    }
  }
  return [...new Set(ids)]
}

/**
 * 교사 관리 파일: 연습·리허설에 쓴 학번(9로 시작)의 기록을 지우는 운영진 도구.
 * 실제 학생 기록을 잘못 지우지 않도록 9로 시작하는 학번만 받습니다.
 */
export function AdminCleanup({ roster, accounts }: { roster: RosterEntry[]; accounts: Account[] }) {
  const [input, setInput] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!note) return
    const timer = window.setTimeout(() => setNote(''), 4000)
    return () => window.clearTimeout(timer)
  }, [note])

  const run = async () => {
    const ids = parseIds(input)
    if (!ids || ids.length === 0) return setNote('학번을 "90001~90003"이나 "90001 90002"처럼 써 주세요. (범위는 50명까지)')
    if (ids.some((id) => !id.startsWith('9'))) return setNote('실제 학생 기록을 지키기 위해 9로 시작하는 연습 학번만 지울 수 있어요.')
    const label = (id: string) => {
      const name = roster.find((item) => item.studentId === id)?.name ?? accounts.find((item) => item.studentId === id)?.name
      return name ? `${id} ${name}` : `${id} (명단에 없음)`
    }
    if (!window.confirm(`아래 학번의 명단·계정·닉네임·코인 신청·지급·교환권을 모두 지울까요? 되돌릴 수 없어요.\n\n${ids.map(label).join('\n')}`)) return
    setBusy(true)
    try {
      let total = 0
      for (const id of ids) total += await removeStudentRecords(id)
      setInput('')
      setNote(total > 0 ? `${ids.length}개 학번에서 기록 ${total}개를 지웠어요.` : '지울 기록이 없었어요.')
    } catch {
      setNote('지우지 못했어요. 인터넷 연결을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>연습 학번 기록 지우기</h2>
          <p>연습·리허설에 쓴 학번(9로 시작)의 명단, 계정, 닉네임, 코인 신청·지급, 교환권을 지워요.</p>
        </div>
      </div>
      {note && <p className="live-message" role="status">{note}</p>}
      <div className="live-row">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="90001~90003" aria-label="지울 연습 학번" />
        <button className="primary-button" disabled={busy} onClick={() => void run()}>{busy ? '지우는 중…' : '지우기'}</button>
      </div>
    </article>
  )
}
