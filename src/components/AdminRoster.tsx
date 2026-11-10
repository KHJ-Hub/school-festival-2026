import { useEffect, useState } from 'react'
import { csvToRows, parseRosterText, rowsToRoster, type Account, type RosterEntry } from './nicknameRules'
import { FoldButton, useFold } from './adminFold'

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
 * - 명단(학번·이름)을 넣습니다(엑셀·CSV·명렬표 PDF·붙여넣기). Firestore(운영진만 읽기)에 저장하고 GitHub에는 넣지 않습니다.
 * - 학번·이름·랭킹 닉네임으로 학생을 찾고, 반별로 봅니다.
 * - 초기화: 명단은 두고 계정·코인·교환권을 지움 / 지우기: 명단까지 모두 지움 / 전체 초기화: 모든 학생 초기화.
 */
export function AdminRoster({ roster, accounts, onAddRoster, onReset, onRemove, onResetAll }: {
  roster: RosterEntry[]
  accounts: Account[]
  onAddRoster: (entries: RosterEntry[]) => Promise<void>
  onReset: (studentId: string) => Promise<number>
  onRemove: (studentId: string) => Promise<number>
  onResetAll: () => Promise<number>
}) {
  const [pasted, setPasted] = useState('')
  const [open, setOpen] = useFold('roster')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [files, setFiles] = useState<RosterFile[]>(readFiles)
  // 방금 읽은 PDF의 글자 모양(이름은 ○로 가림). 인원이 모자랄 때 어떻게 읽혔는지 확인하는 용도.
  const [pdfLooks, setPdfLooks] = useState<{ name: string; count: number; masked: string }[]>([])
  const [busy, setBusy] = useState(false)

  // 지우기·초기화는 되돌릴 수 없어서, 확인 창에 무엇이 지워지는지 적고 운영진이 눌러야만 합니다.
  const resetOne = async (entry: RosterEntry) => {
    if (!window.confirm(`${entry.studentId} ${entry.name} 학생을 초기화할까요? 되돌릴 수 없어요.\n\n계정·랭킹 닉네임·코인 신청·지급·교환권이 지워져요.\n명단(학번·이름)은 남아서 처음부터 다시 등록할 수 있어요.`)) return
    setBusy(true)
    try {
      const count = await onReset(entry.studentId)
      setNote(`${entry.studentId}을 초기화했어요. (기록 ${count}개 지움)`)
    } catch {
      setNote('초기화하지 못했어요. 인터넷 연결을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const removeOne = async (entry: RosterEntry) => {
    if (!window.confirm(`${entry.studentId} ${entry.name} 학생을 명단에서 지울까요? 되돌릴 수 없어요.\n\n명단(학번·이름)·계정·랭킹 닉네임·코인 신청·지급·교환권이 모두 지워져요.\n잘못 들어간 학번일 때 쓰세요.`)) return
    setBusy(true)
    try {
      await onRemove(entry.studentId)
      setNote(`${entry.studentId}을 지웠어요.`)
    } catch {
      setNote('지우지 못했어요. 인터넷 연결을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const resetEveryone = async () => {
    const typed = window.prompt(`모든 학생(등록 ${accounts.length}명)을 초기화해요. 되돌릴 수 없어요.\n\n지워지는 것: 모든 계정·랭킹 닉네임·코인 신청·지급·교환권, 랭킹 화면\n남는 것: 명단(학번·이름), 간식 메뉴\n\n정말 하려면 아래 칸에 "초기화"라고 써 주세요.`)
    if (typed === null) return
    if (typed.trim() !== '초기화') return setNote('"초기화"라고 정확히 써야 진행돼요. 아무것도 지우지 않았어요.')
    setBusy(true)
    setNote('전체 초기화 중…')
    try {
      const count = await onResetAll()
      setNote(`전체 초기화했어요. (기록 ${count}개 지움) 명단은 그대로예요.`)
    } catch {
      setNote('전체 초기화 중에 멈췄어요. 인터넷 연결을 확인하고 다시 눌러 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const rememberFiles = (added: RosterFile[]) => {
    const names = new Set(added.map((item) => item.name))
    const next = [...added, ...files.filter((item) => !names.has(item.name))].slice(0, 40)
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

  /** 파일 하나에서 학번·이름을 읽습니다. 엑셀(.xlsx)·CSV는 표로, 명렬표 PDF는 "학번 다음 낱말 = 이름"으로 읽습니다. */
  // skipped: PDF에서 학번은 있는데 이름을 못 찾은 줄(붙여넣기 칸에 남겨서 운영진이 고칠 수 있게 함)
  const readFile = async (file: File): Promise<{ entries: RosterEntry[]; skipped: string[] }> => {
    if (/\.pdf$/i.test(file.name)) {
      // 세 가지 방법으로 읽어서 학생이 가장 많이 나온 결과를 씁니다.
      const { pdfToTexts, maskNames } = await import('./pdfRoster')
      const tried = (await pdfToTexts(file)).map((text) => ({ text, result: parseRosterText(text) }))
      const best = tried.reduce((a, b) => (b.result.entries.length > a.result.entries.length ? b : a))
      setPdfLooks((current) => [...current, { name: file.name, count: best.result.entries.length, masked: maskNames(best.text) }])
      return best.result
    }
    if (/\.csv$/i.test(file.name)) return { entries: rowsToRoster(csvToRows(await file.text())).entries, skipped: [] }
    if (/\.xlsx$/i.test(file.name)) {
      const { readSheet } = await import('read-excel-file/browser')
      return { entries: rowsToRoster((await readSheet(file)) as unknown[][]).entries, skipped: [] }
    }
    throw new Error('format')
  }

  /** 여러 파일(반별 명렬표 PDF 등)을 한 번에 골라 명단에 넣습니다. 파일은 이 기기에서만 읽고, 학번·이름만 저장합니다. */
  const addFiles = async (picked: FileList | null) => {
    const list = picked ? [...picked] : []
    if (list.length === 0) return
    setNote(`파일 ${list.length}개를 읽는 중…`)
    setPdfLooks([])
    const results: { file: File; entries: RosterEntry[] }[] = []
    const failed: string[] = []
    const leftover: string[] = []
    for (const file of list) {
      try {
        const { entries, skipped } = await readFile(file)
        leftover.push(...skipped)
        if (entries.length > 0) results.push({ file, entries })
        else failed.push(file.name)
      } catch {
        failed.push(file.name)
      }
    }
    const all = [...new Map(results.flatMap((item) => item.entries).map((entry) => [entry.studentId, entry])).values()]
    setPasted(leftover.join('\n'))
    if (all.length === 0) {
      setNote('파일에서 학번(숫자 5자리)과 이름을 찾지 못했어요. 엑셀(.xlsx)·CSV·PDF만 읽을 수 있고, 스캔한 그림 PDF는 못 읽어요.')
      return
    }
    const summary = results.map((item) => `${item.file.name}: ${item.entries.length}명`).join('\n')
    const failNote = (failed.length ? `\n\n못 읽은 파일 ${failed.length}개: ${failed.join(', ')}` : '')
      + (leftover.length ? `\n\n학번은 있는데 이름을 못 찾은 줄 ${leftover.length}개는 붙여넣기 칸에 남겨 둘게요.` : '')
    if (!window.confirm(`모두 ${all.length}명을 찾았어요. 명단에 넣을까요? 같은 학번은 새 이름으로 바뀌어요.\n\n${summary}${failNote}`)) {
      setNote('')
      return
    }
    try {
      await onAddRoster(all)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
      return
    }
    rememberFiles(results.map((item) => ({ name: item.file.name, count: item.entries.length, at: Date.now() })))
    setNote(`${all.length}명을 명단에 넣었어요.${leftover.length ? ` 이름을 못 찾은 ${leftover.length}줄은 붙여넣기 칸에 남겨 두었어요(고쳐서 넣어 주세요).` : ''}${failed.length ? ` 못 읽은 파일 ${failed.length}개가 있어요: ${failed.join(', ')}` : ''}`)
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
  const list = (items: RosterEntry[]) => (
    <ul className="live-list">
      {items.map((entry) => {
        const nickname = nicknameOf(entry.studentId)
        return (
          <li key={entry.studentId}>
            <span>{entry.studentId} · {entry.name}{inRoster(entry.studentId) ? '' : ' (직접 등록)'}</span>
            <span className="live-buttons">
              <b className={`live-status ${nickname ? 'approved' : 'pending'}`}>{nickname ? `등록됨 · ${nickname}` : '아직 등록 안 함'}</b>
              {nickname && <button disabled={busy} onClick={() => void resetOne(entry)}>초기화</button>}
              <button className="ghost" disabled={busy} onClick={() => void removeOne(entry)}>지우기</button>
            </span>
          </li>
        )
      })}
    </ul>
  )
  const rows = shown.length === 0 ? <p className="live-empty">{keyword ? '찾는 학생이 없어요.' : '아직 등록한 학생이 없어요.'}</p> : list(shown)

  // 전체 보기는 반별로 접어서 보여 줍니다. 학번 = 학년 1자리 + 반 2자리 + 번호 2자리(9로 시작하면 연습 학번).
  const classOf = (studentId: string) => (studentId.startsWith('9') ? '연습 학번' : `${studentId[0]}학년 ${Number(studentId.slice(1, 3))}반`)
  const classes = [...people.reduce((map, entry) => {
    const key = classOf(entry.studentId)
    map.set(key, [...(map.get(key) ?? []), entry])
    return map
  }, new Map<string, RosterEntry[]>())]

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

      {/* 찾기 칸은 늘 보이게 두고(상품 줄 때 바로 찾게), 전체 목록은 길어서 접어 둡니다. */}
      <h3>학생 찾기</h3>
      <div className="live-row admin-search">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="학번·이름·랭킹 닉네임" aria-label="학생 찾기" />
      </div>
      {keyword ? rows : (
        <details className="live-fold">
          <summary>전체 보기 (등록 {accounts.length}명 · 명단 {roster.length}명)</summary>
          {classes.length === 0 ? rows : (
            <div className="class-groups">
              {classes.map(([label, members]) => (
                <details key={label} className="class-group">
                  <summary>{label} <small>등록 {members.filter((entry) => nicknameOf(entry.studentId)).length} / {members.length}명</small></summary>
                  {list(members)}
                </details>
              ))}
            </div>
          )}
        </details>
      )}

      <h3>명단 넣기</h3>
      <p className="allow-help">명단에 있는 학번·이름이 맞아야 등록돼요. 전학생처럼 빠진 학생은 붙여넣기로 추가해 주세요.</p>
      <div className="roster-add">
        <div className="roster-file">
          <h3>파일로 넣기 (엑셀·PDF)</h3>
          {/* 1·2·3학년을 따로 넣을 수 있게, 이 기기에서 넣은 파일을 보여 줍니다. */}
          <ul className="roster-files">
            {files.length === 0 ? <li className="empty">아직 넣은 파일이 없어요. 반별 명렬표 PDF를 한꺼번에 골라도 돼요.</li> : files.map((file) => (
              <li key={`${file.name}-${file.at}`}><span>{file.name}</span><b>{file.count}명</b></li>
            ))}
          </ul>
          <label className="admin-file">
            <input type="file" accept=".xlsx,.csv,.pdf" multiple onChange={(event) => { void addFiles(event.target.files); event.target.value = '' }} />
            <span className="primary-button">파일 고르기 (여러 개 가능)</span>
          </label>
        </div>
        <div className="roster-paste">
          <div className="roster-paste-head"><h3>여러 명 붙여넣기</h3></div>
          <textarea className="admin-paste" value={pasted} onChange={(event) => setPasted(event.target.value)} rows={3} placeholder={'90004 홍길동\n90005,김배정'} />
          <button className="primary-button" onClick={() => void addPasted()}>붙여 넣은 명단 넣기</button>
        </div>
      </div>

      {/* 인원이 모자랄 때 원인을 찾는 용도. 이름은 ○로 가려서 화면을 캡처해 보여 줘도 이름이 드러나지 않습니다. */}
      {pdfLooks.length > 0 && (
        <details className="live-fold pdf-look">
          <summary>PDF에서 읽은 모양 보기 (이름은 ○로 가림)</summary>
          {pdfLooks.map((look) => (
            <div key={look.name}>
              <p><b>{look.name}</b> · 찾은 학생 {look.count}명</p>
              <pre>{look.masked || '(글자를 하나도 못 읽었어요. 스캔한 그림 PDF일 수 있어요.)'}</pre>
            </div>
          ))}
        </details>
      )}

      {/* 리허설 뒤 축제 전에: 명단은 두고 모든 학생의 등록·코인·교환권을 지웁니다. */}
      <h3>전체 초기화</h3>
      <div className="reset-all">
        <p className="allow-help">리허설이 끝나면 눌러 주세요. 명단(학번·이름)과 간식 메뉴는 남기고, 모든 학생의 계정·랭킹 닉네임·코인·교환권을 지워요. 한 학생만 할 때는 위 목록의 [초기화]를 쓰세요.</p>
        <button className="ghost" disabled={busy} onClick={() => void resetEveryone()}>전체 초기화</button>
      </div>

      </>)}
    </article>
  )
}
