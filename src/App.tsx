import { useState } from 'react'
import { FestivalLive, StudentIdBox } from './components/FestivalLive'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { ExchangeGuide, VisitorSteps } from './components/PopupIntro'
import { TaskPlayground } from './components/TaskPlayground'
import './components/TaskPlayground.css'
import { CLUBS } from './mockData'

function App() {
  const [mode, setMode] = useState<AppMode>('student')
  const [inputId, setInputId] = useState('90001')

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
            <p className="hero-copy">게임으로 코인을 모으고, 모바일 교환권으로 갓 튀긴 Non-GMO 팝콘을 받아요. 이 화면은 동아리 학생들이 직접 짠 코드로 움직이고, 각 칸의 이름표에서 어느 학생이 만든 기능인지 볼 수 있어요.</p>
          </div>
        </section>

        {mode === 'student' && (
          <>
            <VisitorSteps />
            <StudentIdBox inputId={inputId} onChange={setInputId} />
            <ExchangeGuide />
          </>
        )}

        <FestivalLive mode={mode} inputId={inputId} />

        {mode === 'admin' && <TaskPlayground />}

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
