import { useEffect, useState } from 'react'
import type { Account, RosterEntry } from './nicknameRules'
import { FoldButton, useFold } from './adminFold'
import { isTryId, nextTryIds, tryLink, tryName } from './teacherTry'

/** QR 그림(작은 라이브러리를 필요할 때만 불러옵니다). */
function QrImage({ text }: { text: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let alive = true
    void import('qrcode').then((QRCode) => QRCode.toDataURL(text, { margin: 1, width: 240 })).then((url) => { if (alive) setSrc(url) })
    return () => { alive = false }
  }, [text])
  return src ? <img src={src} alt={`${text} QR`} width={120} height={120} /> : <span className="qr-wait">QR 만드는 중…</span>
}

/**
 * 교사 관리 파일: 선생님 체험용 학번과 QR 만들기.
 * 선생님은 QR을 찍고 [등록]만 누르면 학생과 똑같이 코인 신청 → 교환권 → 부스에서 간식 받기까지 해 볼 수 있습니다.
 * 랭킹에는 나오지 않고, 끝나면 학생 등록 관리에서 [지우기]나 [전체 초기화]로 정리합니다.
 */
export function AdminTeacherTry({ roster, accounts, onAddRoster, onRemove }: {
  roster: RosterEntry[]
  accounts: Account[]
  onAddRoster: (entries: RosterEntry[]) => Promise<void>
  onRemove: (studentId: string) => Promise<number>
}) {
  const [open, setOpen] = useFold('try')
  // 몇 명: 기본 1, 숫자 두 자리(1~99)까지. 지웠다가 다시 쓸 수 있게 글자로 둡니다.
  const [count, setCount] = useState('1')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const tries = roster.filter((entry) => isTryId(entry.studentId)).sort((a, b) => a.studentId.localeCompare(b.studentId))

  useEffect(() => {
    if (!note) return
    const timer = window.setTimeout(() => setNote(''), 4000)
    return () => window.clearTimeout(timer)
  }, [note])

  const make = async () => {
    const howMany = Math.min(99, Math.max(1, Number(count) || 1))
    const ids = nextTryIds(roster.map((entry) => entry.studentId), howMany)
    setBusy(true)
    try {
      await onAddRoster(ids.map((studentId) => ({ studentId, name: tryName(studentId) })))
      setNote(`체험용 학번 ${ids.length}개를 만들었어요. 아래 QR을 인쇄하거나 링크를 보내 주세요.`)
    } catch {
      setNote('만들지 못했어요. 인터넷 연결을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  /** 체험용 학번(99001~)만 명단·계정·코인·교환권까지 모두 지웁니다. 학생 기록은 건드리지 않습니다. */
  const removeAll = async () => {
    if (!window.confirm(`체험용 학번 ${tries.length}개를 모두 지울까요? 되돌릴 수 없어요.\n\n체험 학번의 명단·계정·랭킹 닉네임·코인·교환권이 지워져요.\n학생 기록은 그대로예요.`)) return
    setBusy(true)
    setNote('지우는 중…')
    let done = 0
    try {
      for (const entry of tries) {
        await onRemove(entry.studentId)
        done += 1
      }
      setNote(`체험용 학번 ${done}개를 지웠어요.`)
    } catch {
      setNote(`${done}개를 지우고 멈췄어요. 인터넷 연결을 확인하고 다시 눌러 주세요.`)
    } finally {
      setBusy(false)
    }
  }

  const copy = async (studentId: string) => {
    try {
      await navigator.clipboard.writeText(tryLink(studentId))
      setNote(`${tryName(studentId)} 링크를 복사했어요.`)
    } catch {
      setNote('복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.')
    }
  }

  return (
    <article className={`panel live-section admin-roster teacher-try ${open ? '' : 'folded'}`}>
      <div className="live-head">
        <div>
          <h2>선생님 체험</h2>
          <p>선생님은 QR을 찍고 [등록]만 누르면 학생처럼 코인을 받고 간식까지 받아 볼 수 있어요. 랭킹에는 안 나와요.</p>
        </div>
        <FoldButton open={open} onToggle={setOpen} />
      </div>
      {open && (<>
      {note && <p className="live-message" role="status">{note}</p>}
      <div className="live-row">
        <label className="field narrow">몇 명<input inputMode="numeric" maxLength={2} value={count} onChange={(event) => setCount(event.target.value.replace(/\D/g, '').slice(0, 2))} aria-label="만들 체험용 학번 수(1~99)" /></label>
        <button className="primary-button" disabled={busy} onClick={() => void make()}>{busy ? '만드는 중…' : '체험용 QR 만들기'}</button>
        {tries.length > 0 && <button className="live-reset" onClick={() => window.print()}>QR 인쇄</button>}
      </div>
      {tries.length === 0 ? <p className="live-empty">아직 체험용 학번이 없어요.</p> : (
        <div className="try-print">
          <p className="try-print-title">배정 팝팝스토어 선생님 체험 · QR을 찍고 [등록]을 눌러 주세요</p>
          <ul className="try-cards">
            {tries.map((entry) => {
              const account = accounts.find((item) => item.studentId === entry.studentId)
              return (
                <li key={entry.studentId}>
                  <QrImage text={tryLink(entry.studentId)} />
                  <div>
                    <strong>{entry.name}</strong>
                    <span>학번 {entry.studentId}</span>
                    <small className={account ? 'used' : ''}>{account ? `사용 중 · ${account.nickname}` : '아직 안 씀'}</small>
                    <button className="live-reset" onClick={() => void copy(entry.studentId)}>링크 복사</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {tries.length > 0 && (
        <div className="reset-all">
          <p className="allow-help">체험이 끝나면 눌러 주세요. 체험용 학번 {tries.length}개만 모두 지우고, 학생 기록은 그대로 둬요.</p>
          <button className="ghost" disabled={busy} onClick={() => void removeAll()}>체험 학번 모두 지우기</button>
        </div>
      )}
      </>)}
    </article>
  )
}
