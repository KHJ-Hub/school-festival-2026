import { useState } from 'react'
import { FestivalLive } from './components/FestivalLive'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { TaskPlayground } from './components/TaskPlayground'
import './components/TaskPlayground.css'
import { CLUBS } from './mockData'

function App() {
  const [mode, setMode] = useState<AppMode>('student')

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setMode('student')} aria-label="첫 화면으로 이동">
          <span className="brand-mark">F!</span>
          <span>
            <strong>모여라! 축제 연구소</strong>
            <small>2026 연합 동아리 프로젝트</small>
          </span>
        </button>
        <div className="header-actions">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="festival-date"><span>축제까지</span><strong>12월 29일</strong></div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">{mode === 'student' ? '학생용 화면' : '운영진용 화면'}</p>
            <h1>놀고, 모으고,<br /><em>함께 기록해요.</em></h1>
            <p className="hero-copy">이 화면은 동아리 학생들이 직접 짠 코드로 움직여요. 각 칸의 이름표에서 어느 학생이 만든 기능인지 확인할 수 있어요.</p>
          </div>
        </section>

        <div className="demo-alert" role="note">
          <span>ⓘ</span>
          <p><strong>연습용 학번(90001~90003)과 가상 데이터예요.</strong> 새로고침하면 처음 상태로 돌아가요. 아직 만들지 않은 기능은 "만드는 중"으로 보여요.</p>
        </div>

        <FestivalLive mode={mode} />

        {mode === 'admin' && <TaskPlayground />}

        <section className="clubs">
          <span>함께 만드는 동아리</span>
          <div>{CLUBS.map((club, index) => <span key={club}><i>{['♟', '⚙', '◎'][index]}</i>{club}</span>)}</div>
        </section>
      </main>

      <footer>
        <span>2026 학교 축제 프로젝트</span>
        <span>실습용 프론트엔드 · 서버 연결 전</span>
      </footer>
    </div>
  )
}

export default App
