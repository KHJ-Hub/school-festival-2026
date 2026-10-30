import { useState } from 'react'
import { AdminLock } from './components/AdminLock'
import { AdminRoster } from './components/AdminRoster'
import { FestivalLive, StudentIdBox } from './components/FestivalLive'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { checkNickname, enterStudent, type Account, type RosterEntry } from './components/nicknameRules'
import { VisitorSteps } from './components/PopupIntro'
import { CLUBS } from './mockData'
import { DEMO_STUDENTS } from './tasks/fixtures'

/** 연습용 명단: 가짜 이름만 씁니다. 실제 학생 명단은 코드에 넣지 않고 운영진 화면에서 입력합니다. */
const PRACTICE_ROSTER: RosterEntry[] = DEMO_STUDENTS.map((student, index) => ({ studentId: student.studentId, name: `연습학생${index + 1}` }))

function App() {
  const [mode, setMode] = useState<AppMode>('student')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  // 아래 값은 모두 이 화면(기기) 메모리에만 있습니다. 새로고침하면 처음 상태로 돌아갑니다.
  const [roster, setRoster] = useState<RosterEntry[]>(PRACTICE_ROSTER)
  const [accounts, setAccounts] = useState<Account[]>(
    () => DEMO_STUDENTS.map((student, index) => ({ studentId: student.studentId, name: PRACTICE_ROSTER[index]!.name, nickname: student.nickname })),
  )
  const [extraWords, setExtraWords] = useState<string[]>([])
  const [meId, setMeId] = useState<string | null>(null)
  const me = accounts.find((account) => account.studentId === meId) ?? null

  const enter = (input: { studentId: string; name: string; nickname: string }) => {
    const result = enterStudent(roster, accounts, extraWords, input)
    if (!result.ok) return result.message
    if (result.kind === 'new') setAccounts((current) => [...current, result.account])
    setMeId(result.account.studentId)
    return null
  }

  const rename = (nickname: string) => {
    if (!me) return '먼저 등록해 주세요.'
    const problem = checkNickname(nickname, accounts, extraWords, me.studentId)
    if (problem) return problem
    setAccounts((current) => current.map((account) => (account.studentId === me.studentId ? { ...account, nickname: nickname.trim() } : account)))
    return null
  }

  const addRoster = (entries: RosterEntry[]) => {
    setRoster((current) => {
      const next = current.filter((entry) => !entries.some((item) => item.studentId === entry.studentId))
      return [...next, ...entries]
    })
  }

  const adminLocked = mode === 'admin' && !adminUnlocked

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setMode('student')} aria-label="첫 화면으로 이동">
          <span className="brand-mark">F!</span>
          <span>
            <strong>배정고 친환경 팝업스토어</strong>
            <small>보드게임동아리 × 리틀엔지니어랩 × 국제이해문화탐구반</small>
          </span>
        </button>
        <div className="header-actions">
          <ModeSwitcher mode={mode} onChange={setMode} />
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">{mode === 'student' ? '학생용 화면' : '운영진용 화면'}</p>
            <h1>배정고<br /><em>친환경 팝업스토어</em></h1>
          </div>
        </section>

        {mode === 'student' && (
          <>
            <VisitorSteps />
            <StudentIdBox me={me} onEnter={enter} onRename={rename} onLeave={() => setMeId(null)} />
          </>
        )}

        {adminLocked && <AdminLock onUnlock={() => setAdminUnlocked(true)} />}

        {mode === 'admin' && adminUnlocked && (
          <div className="admin-tools">
            <button className="live-reset" onClick={() => setAdminUnlocked(false)}>운영진 화면 잠그기</button>
            <AdminRoster
              roster={roster}
              accounts={accounts}
              extraWords={extraWords}
              onAddRoster={addRoster}
              onAddWord={(word) => setExtraWords((current) => (current.includes(word) ? current : [...current, word]))}
              onRemoveWord={(word) => setExtraWords((current) => current.filter((item) => item !== word))}
            />
          </div>
        )}

        {/* 잠겨 있어도 신청·교환권 기록이 지워지지 않도록 화면만 숨깁니다. */}
        <div hidden={adminLocked}>
          <FestivalLive mode={mode} studentId={me?.studentId ?? ''} accounts={accounts} />
        </div>

        <section className="clubs">
          <span>함께 만드는 동아리</span>
          <div>{CLUBS.map((club, index) => <span key={club}><i>{['♟', '⚙', '◎'][index]}</i>{club}</span>)}</div>
        </section>
      </main>

      <footer>
        <span>2026 학교 축제 프로젝트</span>
      </footer>
    </div>
  )
}

export default App
