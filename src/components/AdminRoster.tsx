import { useState } from 'react'
import { BASE_BANNED_WORDS, normalizeForCheck, parseRosterText, type Account, type RosterEntry } from './nicknameRules'

/**
 * 교사 관리 파일: 운영진 화면의 학생 명단(학번·이름)과 금지어 관리.
 * 명단은 Firestore(운영진만 읽기)에 저장하고 GitHub에는 넣지 않습니다. 학생은 명단을 볼 수 없고 등록할 때 대조만 됩니다.
 */
export function AdminRoster({ roster, accounts, extraWords, onAddRoster, onAddWord, onRemoveWord }: {
  roster: RosterEntry[]
  accounts: Account[]
  extraWords: string[]
  onAddRoster: (entries: RosterEntry[]) => Promise<void>
  onAddWord: (word: string) => Promise<void>
  onRemoveWord: (word: string) => Promise<void>
}) {
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [pasted, setPasted] = useState('')
  const [word, setWord] = useState('')
  const [note, setNote] = useState('')

  const addOne = async () => {
    const parsed = parseRosterText(`${studentId.trim()} ${name.trim()}`)
    if (parsed.entries.length === 0) {
      setNote('학번(숫자 5자리)과 이름을 모두 써 주세요.')
      return
    }
    try {
      await onAddRoster(parsed.entries)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
      return
    }
    setStudentId('')
    setName('')
    setNote(`${parsed.entries[0]!.studentId} 학생을 명단에 넣었어요.`)
  }

  const addPasted = async () => {
    const { entries, skipped } = parseRosterText(pasted)
    if (entries.length > 0) {
      try {
        await onAddRoster(entries)
      } catch {
        setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
        return
      }
    }
    setPasted(skipped.join('\n'))
    setNote(`${entries.length}명을 명단에 넣었어요.${skipped.length ? ` 형식이 맞지 않는 ${skipped.length}줄은 칸에 남겨 두었어요.` : ''}`)
  }

  const addWord = async () => {
    const value = word.trim()
    if (!normalizeForCheck(value)) {
      setNote('금지어에는 한글이나 영어가 들어가야 해요.')
      return
    }
    try {
      await onAddWord(value)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
      return
    }
    setWord('')
    setNote(`"${value}"를 금지어에 추가했어요.`)
  }

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>학생 명단 · 금지어</h2>
          <p>학번과 이름은 운영진 화면에서만 보여요. 학생은 명단에 있는 학번·이름으로만 등록할 수 있어요.</p>
        </div>
      </div>

      {note && <p className="live-message" role="status">{note}</p>}

      <h3>한 명씩 넣기</h3>
      <div className="live-row">
        <input value={studentId} onChange={(event) => setStudentId(event.target.value)} inputMode="numeric" maxLength={5} placeholder="학번" aria-label="학번" />
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" aria-label="이름" />
        <button className="primary-button" onClick={() => void addOne()}>명단에 넣기</button>
      </div>

      <h3>여러 명 붙여넣기</h3>
      <p className="live-empty">한 줄에 한 명씩 "학번 이름" 또는 "학번,이름" 형식으로 붙여 넣어요. 엑셀에서 두 칸을 복사해도 돼요.</p>
      <textarea className="admin-paste" value={pasted} onChange={(event) => setPasted(event.target.value)} rows={4} placeholder={'90004 홍길동\n90005,김배정'} />
      <button className="primary-button" onClick={() => void addPasted()}>붙여 넣은 명단 넣기</button>

      <h3>명단 ({roster.length}명 · 등록 {accounts.length}명)</h3>
      <ul className="live-list">
        {roster.map((entry) => {
          const account = accounts.find((item) => item.studentId === entry.studentId)
          return (
            <li key={entry.studentId}>
              <span>{entry.studentId} · {entry.name}</span>
              <b className={`live-status ${account ? 'approved' : 'pending'}`}>{account ? `등록됨 · ${account.nickname}` : '아직 등록 안 함'}</b>
            </li>
          )
        })}
      </ul>

      <h3>금지어</h3>
      <p className="live-empty">기본 금지어 {BASE_BANNED_WORDS.length}개가 들어 있어요. 여기서 추가한 단어는 모든 학생 기기에 적용돼요.</p>
      <div className="live-row">
        <input value={word} onChange={(event) => setWord(event.target.value)} placeholder="추가할 금지어" aria-label="추가할 금지어" />
        <button className="primary-button" onClick={() => void addWord()}>금지어 추가</button>
      </div>
      {extraWords.length > 0 && (
        <ul className="live-list">
          {extraWords.map((item) => (
            <li key={item}><span>{item}</span><button className="ghost" onClick={() => void onRemoveWord(item)}>빼기</button></li>
          ))}
        </ul>
      )}
    </article>
  )
}
