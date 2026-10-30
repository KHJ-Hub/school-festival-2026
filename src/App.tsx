import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut, type User } from 'firebase/auth'
import { AdminLock, AdminPasswordChange } from './components/AdminLock'
import { AdminRoster } from './components/AdminRoster'
import { AdminRankingSync, FestivalLive, RankingBoard, StudentIdBox } from './components/FestivalLive'
import { ModeSwitcher, type AppMode } from './components/ModeSwitcher'
import { checkNickname, type Account } from './components/nicknameRules'
import { VisitorSteps } from './components/PopupIntro'
import { enterStudent, isNicknameTaken, loadOwnAccount, renameStudent, saveBannedWords, saveRoster, useAdminData, useBannedWords } from './data/store'
import { ADMIN_EMAIL, auth } from './firebase'
import { CLUBS } from './mockData'

/** 이 기기에서 마지막으로 들어온 학번(새로고침해도 다시 들어오기). 학번만 저장하고 이름은 저장하지 않습니다. */
const ME_KEY = 'festival-me'

function readMe(): string | null {
  try {
    return localStorage.getItem(ME_KEY)
  } catch {
    return null
  }
}

function writeMe(studentId: string | null) {
  try {
    if (studentId) localStorage.setItem(ME_KEY, studentId)
    else localStorage.removeItem(ME_KEY)
  } catch {
    // 시크릿 창 등 저장이 안 되는 브라우저는 새로고침하면 다시 들어오면 됩니다.
  }
}

function App() {
  // 주소 끝 #ranking / #admin 으로 화면을 바로 열 수 있습니다(교실 TV에는 #ranking).
  const [mode, setModeState] = useState<AppMode>(() => (window.location.hash === '#ranking' ? 'ranking' : window.location.hash === '#admin' ? 'admin' : 'student'))
  const setMode = (next: AppMode) => {
    setModeState(next)
    window.history.replaceState(null, '', next === 'student' ? window.location.pathname + window.location.search : `#${next}`)
  }
  const [user, setUser] = useState<User | null>(null)
  const [me, setMe] = useState<Account | null>(null)
  const isAdmin = user?.email === ADMIN_EMAIL
  const bannedWords = useBannedWords()
  const admin = useAdminData(isAdmin)

  // 학생은 화면에 안 보이는 익명 로그인으로 기기마다 구분합니다. 운영진이 잠그면 다시 익명으로 돌아갑니다.
  useEffect(() => onAuthStateChanged(auth, (next) => {
    setUser(next)
    if (!next) void signInAnonymously(auth).catch(() => undefined)
  }), [])

  // 새로고침 후: 이 기기에서 들어왔던 학번이 여전히 내 계정이면 자동으로 다시 들어옵니다.
  useEffect(() => {
    if (!user || isAdmin || me) return
    const saved = readMe()
    if (!saved) return
    void loadOwnAccount(saved).then((account) => {
      if (account) setMe(account)
      else writeMe(null)
    })
  }, [user, isAdmin, me])

  const nicknameProblem = async (nickname: string, selfId?: string) => {
    const problem = checkNickname(nickname, [], bannedWords, selfId)
    if (problem) return problem
    if (await isNicknameTaken(nickname, selfId)) return '이미 다른 학생이 쓰는 닉네임이에요. 다른 닉네임을 정해 주세요.'
    return null
  }

  const enter = async (input: { studentId: string; name: string; nickname: string }) => {
    const studentId = input.studentId.trim()
    const name = input.name.trim()
    if (!/^\d{5}$/.test(studentId)) return '학번은 숫자 5자리로 써 주세요.'
    if (!name) return '이름을 써 주세요.'
    const result = await enterStudent({ studentId, name, nickname: input.nickname.trim() }, (nickname) => nicknameProblem(nickname))
    if (!result.ok) return result.message
    setMe(result.account)
    writeMe(result.account.studentId)
    return null
  }

  const rename = async (nickname: string) => {
    if (!me) return '먼저 등록해 주세요.'
    const value = nickname.trim()
    const problem = await nicknameProblem(value, me.studentId)
    if (problem) return problem
    const failed = await renameStudent(me, value)
    if (failed) return failed
    setMe({ ...me, nickname: value })
    return null
  }

  const leave = () => {
    setMe(null)
    writeMe(null)
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
          <ModeSwitcher mode={mode} onChange={setMode} />
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">{mode === 'student' ? '학생용 화면' : mode === 'admin' ? '운영진용 화면' : '실시간 코인 랭킹'}</p>
            <h1>배정고<br /><em>친환경 팝업스토어</em></h1>
          </div>
        </section>

        {mode === 'student' && (
          <>
            <VisitorSteps />
            {isAdmin ? (
              <div className="live-message" role="status">이 기기는 운영진으로 로그인되어 있어요. 운영진용 화면에서 잠그면 학생 화면을 쓸 수 있어요.</div>
            ) : (
              <StudentIdBox me={me} busy={!user} onEnter={enter} onRename={rename} onLeave={leave} />
            )}
          </>
        )}

        {mode === 'admin' && !isAdmin && <AdminLock />}

        {mode === 'admin' && isAdmin && (
          <div className="admin-tools">
            <button className="live-reset" onClick={() => void signOut(auth)}>운영진 화면 잠그기</button>
            <AdminRoster
              roster={admin.roster}
              accounts={admin.accounts}
              extraWords={bannedWords}
              onAddRoster={saveRoster}
              onAddWord={(word) => saveBannedWords(bannedWords.includes(word) ? bannedWords : [...bannedWords, word])}
              onRemoveWord={(word) => saveBannedWords(bannedWords.filter((item) => item !== word))}
            />
            <AdminPasswordChange />
          </div>
        )}

        {mode === 'ranking' && <RankingBoard />}

        {isAdmin && <AdminRankingSync />}

        {(mode === 'student' || (mode === 'admin' && isAdmin)) && <FestivalLive mode={mode} me={isAdmin ? null : me} isAdmin={isAdmin} />}

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
