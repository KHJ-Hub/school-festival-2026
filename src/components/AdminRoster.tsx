import { useEffect, useState } from 'react'
import { csvToRows, normalizeForCheck, parseRosterText, rowsToRoster, type Account, type RosterEntry } from './nicknameRules'

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
  const [pasted, setPasted] = useState('')
  const [word, setWord] = useState('')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)

  // 알림 문구는 4초 뒤 사라집니다(자리 차지하지 않게).
  useEffect(() => {
    if (!note) return
    const timer = window.setTimeout(() => setNote(''), 4000)
    return () => window.clearTimeout(timer)
  }, [note])

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

  /** 엑셀(.xlsx)·CSV 파일에서 학번·이름을 읽어 명단에 넣습니다. 파일은 이 기기에서만 읽고, 학번·이름만 저장합니다. */
  const addFile = async (file: File | undefined) => {
    if (!file) return
    let rows: unknown[][]
    try {
      if (/\.csv$/i.test(file.name)) {
        rows = csvToRows(await file.text())
      } else if (/\.xlsx$/i.test(file.name)) {
        const { readSheet } = await import('read-excel-file/browser')
        rows = (await readSheet(file)) as unknown[][]
      } else {
        setNote('엑셀(.xlsx) 또는 CSV 파일만 넣을 수 있어요. 예전 엑셀(.xls)은 "다른 이름으로 저장 → Excel 통합 문서(.xlsx)"로 바꿔 주세요.')
        return
      }
    } catch {
      setNote('파일을 읽지 못했어요. 엑셀에서 다시 저장한 뒤 넣어 주세요.')
      return
    }
    const { entries, skipped } = rowsToRoster(rows)
    if (entries.length === 0) {
      setNote('파일에서 학번(숫자 5자리)과 이름을 찾지 못했어요. 첫 줄에 "학번", "이름" 제목을 넣어 주세요.')
      return
    }
    if (!window.confirm(`${file.name}에서 ${entries.length}명을 찾았어요.${skipped ? ` (형식이 맞지 않는 ${skipped}줄은 건너뜀)` : ''} 명단에 넣을까요? 같은 학번은 새 이름으로 바뀌어요.`)) return
    try {
      await onAddRoster(entries)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
      return
    }
    setNote(`${entries.length}명을 명단에 넣었어요.${skipped ? ` 형식이 맞지 않는 ${skipped}줄은 건너뛰었어요.` : ''}`)
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

  const keyword = search.trim()
  const shown = keyword ? roster.filter((entry) => entry.studentId.includes(keyword) || entry.name.includes(keyword)) : roster

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>학생 명단 · 금지어</h2>
        </div>
      </div>

      {note && <p className="live-message" role="status">{note}</p>}

      {/* 넓은 화면에서는 엑셀 파일과 붙여넣기를 나란히 두고, 폰에서는 붙여넣기를 접어 둡니다. */}
      <div className="roster-add">
        <div>
          <h3>엑셀 파일로 넣기</h3>
          <label className="admin-file">
            <input type="file" accept=".xlsx,.csv" onChange={(event) => { void addFile(event.target.files?.[0]); event.target.value = '' }} />
            <span className="primary-button">파일 고르기</span>
          </label>
        </div>
        <div className={`roster-paste ${pasteOpen ? 'open' : ''}`}>
          <div className="roster-paste-head">
            <h3>여러 명 붙여넣기</h3>
            <button type="button" className="live-toggle roster-paste-toggle" onClick={() => setPasteOpen((value) => !value)} aria-expanded={pasteOpen}>{pasteOpen ? '접기' : '펼치기'}</button>
          </div>
          <div className="roster-paste-body">
            <textarea className="admin-paste" value={pasted} onChange={(event) => setPasted(event.target.value)} rows={3} placeholder={'90004 홍길동\n90005,김배정'} />
            <button className="primary-button" onClick={() => void addPasted()}>붙여 넣은 명단 넣기</button>
          </div>
        </div>
      </div>

      {/* 전교생을 넣으면 길어지므로 접어 두고, 펼치면 학번·이름으로 찾을 수 있게 합니다. */}
      <details className="live-fold">
        <summary>명단 ({roster.length}명 · 등록 {accounts.length}명)</summary>
        <div className="live-row admin-search">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="학번이나 이름으로 찾기" aria-label="명단에서 찾기" />
        </div>
        {shown.length === 0 ? <p className="live-empty">{keyword ? '찾는 학생이 없어요.' : '아직 명단이 없어요.'}</p> : (
          <ul className="live-list">
            {shown.map((entry) => {
              const account = accounts.find((item) => item.studentId === entry.studentId)
              return (
                <li key={entry.studentId}>
                  <span>{entry.studentId} · {entry.name}</span>
                  <b className={`live-status ${account ? 'approved' : 'pending'}`}>{account ? `등록됨 · ${account.nickname}` : '아직 등록 안 함'}</b>
                </li>
              )
            })}
          </ul>
        )}
      </details>

      <h3>금지어</h3>
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
