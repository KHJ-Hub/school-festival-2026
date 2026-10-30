import { useState } from 'react'
import { FestivalLive, StudentIdBox, type Me } from './components/FestivalLive'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { VisitorSteps } from './components/PopupIntro'
import { CLUBS } from './mockData'
import { DEMO_STUDENTS } from './tasks/fixtures'

function App() {
  const [mode, setMode] = useState<AppMode>('student')
  const [inputId, setInputId] = useState('90001')
  // 학번 → 닉네임. 시연 학생은 미리 채워 두고, 새로 입력한 닉네임은 이 화면에서만 기억합니다(저장 안 함).
  const [nicknames, setNicknames] = useState<Record<string, string>>(
    () => Object.fromEntries(DEMO_STUDENTS.map((student) => [student.studentId, student.nickname])),
  )
  // 등록을 눌러야 그 학번으로 기능이 열립니다.
  const [me, setMe] = useState<Me | null>(null)
  const [draftNick, setDraftNick] = useState(() => nicknames['90001'] ?? '')
  const studentId = inputId.trim()

  const changeId = (value: string) => {
    setInputId(value)
    setDraftNick(nicknames[value.trim()] ?? '')
  }
  const register = () => {
    const nickname = draftNick.trim()
    setNicknames((current) => ({ ...current, [studentId]: nickname }))
    setMe({ studentId, nickname })
  }

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
          <ModeSwitcher mode={mode} onChange={setMode} />        </div>
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
            <StudentIdBox me={me} inputId={inputId} onIdChange={changeId} nickname={draftNick} onNicknameChange={setDraftNick} onRegister={register} onReset={() => setMe(null)} />
          </>
        )}

        <FestivalLive mode={mode} studentId={me?.studentId ?? ''} nicknames={nicknames} />

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
