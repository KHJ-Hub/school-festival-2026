import { useEffect, useState } from 'react'
import { csvToRows, parseRosterText, rowsToRoster, type Account, type RosterEntry } from './nicknameRules'
import { FoldButton, useFold } from './adminFold'
import { clampRange, rangeExample, type IdRange } from './studentIdRules'

/** 이 기기에서 넣은 명단 파일 목록(파일 이름·인원만, 학생 정보는 저장하지 않음) */
type RosterFile = { name: string; count: number; at: number }
const FILES_KEY = 'roster-files'

function readFiles(): RosterFile[] {
  try {
    const saved = JSON.parse(localStorage.getItem(FILES_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

/**
 * 교사 관리 파일: 운영진 화면의 학생 등록 관리.
 * - 등록할 수 있는 학번 범위(학년·반·번호)를 정합니다. 범위 안의 학번이면 명단 없이도 등록됩니다.
 * - 명단(학번·이름)은 선택: 넣은 학번은 이름까지 확인합니다. Firestore(운영진만 읽기)에 저장하고 GitHub에는 넣지 않습니다.
 * - 학번·이름·랭킹 닉네임으로 학생을 찾고, 남의 학번으로 잘못 등록된 경우 "등록 풀기"를 합니다.
 */
export function AdminRoster({ roster, accounts, onAddRoster, idRange, onSaveRange, onRelease }: {
  roster: RosterEntry[]
  accounts: Account[]
  onAddRoster: (entries: RosterEntry[]) => Promise<void>
  idRange: IdRange
  onSaveRange: (range: IdRange) => Promise<void>
  onRelease: (studentId: string) => Promise<void>
}) {
  const [pasted, setPasted] = useState('')
  const [open, setOpen] = useFold('roster')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [files, setFiles] = useState<RosterFile[]>(readFiles)
  const [range, setRange] = useState(idRange)
  // 서버 값이 바뀌면(처음 읽을 때 포함) 입력칸도 맞춥니다.
  useEffect(() => setRange(idRange), [idRange])

  const saveRange = async () => {
    const value = clampRange(range)
    try {
      await onSaveRange(value)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
      return
    }
    setNote(`이제 ${rangeExample(value)} 학번(과 연습용 9로 시작하는 학번)으로 등록할 수 있어요.`)
  }

  const release = async (entry: RosterEntry, nickname: string) => {
    if (!window.confirm(`${entry.studentId} ${entry.name} (${nickname})의 등록을 풀까요?\n\n계정과 랭킹 닉네임만 지워지고, 코인·교환권 기록은 학번에 남아요. 진짜 주인이 이 학번으로 새로 등록할 수 있게 돼요.`)) return
    try {
      await onRelease(entry.studentId)
      setNote(`${entry.studentId}의 등록을 풀었어요.`)
    } catch {
      setNote('등록을 풀지 못했어요. 인터넷 연결을 확인해 주세요.')
    }
  }

  const rememberFile = (file: RosterFile) => {
    const next = [file, ...files.filter((item) => item.name !== file.name)].slice(0, 10)
    setFiles(next)
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(next))
    } catch {
      // 기억 못 해도 명단은 이미 저장됐습니다.
    }
  }

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
    rememberFile({ name: file.name, count: entries.length, at: Date.now() })
    setNote(`${entries.length}명을 명단에 넣었어요.${skipped ? ` 형식이 맞지 않는 ${skipped}줄은 건너뛰었어요.` : ''}`)
  }

  // 찾기 대상 = 명단 + 명단에 없이 등록한 학생. 학번·이름·랭킹 닉네임으로 찾고 띄어쓰기는 무시합니다(상품 줄 때 닉네임으로 찾기).
  const people: RosterEntry[] = [
    ...roster,
    ...accounts.filter((account) => !roster.some((entry) => entry.studentId === account.studentId)).map(({ studentId, name }) => ({ studentId, name })),
  ].sort((a, b) => a.studentId.localeCompare(b.studentId))
  const keyword = search.replace(/\s/g, '')
  const nicknameOf = (studentId: string) => accounts.find((item) => item.studentId === studentId)?.nickname ?? ''
  const inRoster = (studentId: string) => roster.some((entry) => entry.studentId === studentId)
  const shown = keyword
    ? people.filter((entry) => entry.studentId.includes(keyword) || entry.name.replace(/\s/g, '').includes(keyword) || nicknameOf(entry.studentId).replace(/\s/g, '').includes(keyword))
    : people
  const rows = (
    shown.length === 0 ? <p className="live-empty">{keyword ? '찾는 학생이 없어요.' : '아직 등록한 학생이 없어요.'}</p> : (
      <ul className="live-list">
        {shown.map((entry) => {
          const nickname = nicknameOf(entry.studentId)
          return (
            <li key={entry.studentId}>
              <span>{entry.studentId} · {entry.name}{inRoster(entry.studentId) ? '' : ' (직접 등록)'}</span>
              <span className="live-buttons">
                <b className={`live-status ${nickname ? 'approved' : 'pending'}`}>{nickname ? `등록됨 · ${nickname}` : '아직 등록 안 함'}</b>
                {nickname && <button className="ghost" onClick={() => void release(entry, nickname)}>등록 풀기</button>}
              </span>
            </li>
          )
        })}
      </ul>
    )
  )

  return (
    <article className={`panel live-section admin-roster ${open ? '' : 'folded'}`}>
      <div className="live-head">
        <div>
          <h2>학생 등록 관리</h2>
        </div>
        <FoldButton open={open} onToggle={setOpen} />
      </div>
      {open && (<>

      {note && <p className="live-message" role="status">{note}</p>}

      {/* 명단 없이도 등록할 수 있게, 있을 수 있는 학번(학년·반·번호)만 받습니다. */}
      <h3>등록할 수 있는 학번</h3>
      <p className="allow-help">학번 = 학년 1자리 + 반 2자리 + 번호 2자리 (예: 1학년 3반 5번 → 10305). 지금: {rangeExample(idRange)} · 연습용 9로 시작하는 학번</p>
      <div className="live-row">
        <label className="field narrow">학년 수<input type="number" min={1} max={8} value={range.grades} onChange={(event) => setRange({ ...range, grades: Number(event.target.value) })} /></label>
        <label className="field narrow">반 (최대)<input type="number" min={1} max={99} value={range.classes} onChange={(event) => setRange({ ...range, classes: Number(event.target.value) })} /></label>
        <label className="field narrow">번호 (최대)<input type="number" min={1} max={99} value={range.numbers} onChange={(event) => setRange({ ...range, numbers: Number(event.target.value) })} /></label>
        <button className="primary-button" onClick={() => void saveRange()}>저장</button>
      </div>

      {/* 찾기 칸은 늘 보이게 두고(상품 줄 때 바로 찾게), 전체 목록은 길어서 접어 둡니다. */}
      <h3>학생 찾기</h3>
      <div className="live-row admin-search">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="학번·이름·랭킹 닉네임" aria-label="학생 찾기" />
      </div>
      {keyword ? rows : (
        <details className="live-fold">
          <summary>전체 보기 (등록 {accounts.length}명 · 명단 {roster.length}명)</summary>
          {rows}
        </details>
      )}

      <h3>명단 넣기 (선택)</h3>
      <p className="allow-help">안 넣어도 등록할 수 있어요. 명단을 넣은 학번은 이름까지 맞아야 등록돼요(남의 학번 도용 방지).</p>
      <div className="roster-add">
        <div className="roster-file">
          <h3>엑셀 파일로 넣기</h3>
          {/* 1·2·3학년을 따로 넣을 수 있게, 이 기기에서 넣은 파일을 보여 줍니다. */}
          <ul className="roster-files">
            {files.length === 0 ? <li className="empty">아직 넣은 파일이 없어요. 학년별로 따로 넣어도 돼요.</li> : files.map((file) => (
              <li key={`${file.name}-${file.at}`}><span>{file.name}</span><b>{file.count}명</b></li>
            ))}
          </ul>
          <label className="admin-file">
            <input type="file" accept=".xlsx,.csv" onChange={(event) => { void addFile(event.target.files?.[0]); event.target.value = '' }} />
            <span className="primary-button">파일 고르기</span>
          </label>
        </div>
        <div className="roster-paste">
          <div className="roster-paste-head"><h3>여러 명 붙여넣기</h3></div>
          <textarea className="admin-paste" value={pasted} onChange={(event) => setPasted(event.target.value)} rows={3} placeholder={'90004 홍길동\n90005,김배정'} />
          <button className="primary-button" onClick={() => void addPasted()}>붙여 넣은 명단 넣기</button>
        </div>
      </div>

      </>)}
    </article>
  )
}
