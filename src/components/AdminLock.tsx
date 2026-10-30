import { useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword, updatePassword } from 'firebase/auth'
import { ADMIN_EMAIL, auth } from '../firebase'

/**
 * 교사 관리 파일: 운영진 화면 비밀번호 잠금.
 * 화면에는 비밀번호 칸만 있고, 확인은 Firebase 로그인(운영진 계정 하나)으로 합니다.
 * 비밀번호는 코드나 GitHub에 들어가지 않고, 바꾸면 모든 기기에 바로 적용됩니다.
 * 비밀번호를 잊으면: Firebase 콘솔 > Authentication > 사용자에서 admin 계정을 지우고 같은 이메일로 다시 추가합니다.
 */
export function AdminLock() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  const submit = async () => {
    setWorking(true)
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
      setError('')
      setPassword('')
    } catch {
      setError('비밀번호가 맞지 않아요. (인터넷 연결도 확인해 주세요)')
    }
    setWorking(false)
  }

  return (
    <section className="panel live-id admin-lock">
      <form className="live-id-fields" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <label>
          운영진 비밀번호
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        <div className="live-id-action">
          <button className="primary-button" type="submit" disabled={working}>{working ? '확인 중…' : '잠금 풀기'} <span>→</span></button>
        </div>
      </form>
      {error && <p className="live-error" role="alert">{error}</p>}
    </section>
  )
}

/** 운영진 화면 안에서 비밀번호 바꾸기. 지금 비밀번호를 맞혀야 바꿀 수 있고, 모든 기기에 적용됩니다. */
export function AdminPasswordChange() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setNote('')
    const user = auth.currentUser
    if (!user || user.email !== ADMIN_EMAIL) return setError('운영진으로 로그인한 상태에서만 바꿀 수 있어요.')
    if (next.length < 6) return setError('새 비밀번호는 6글자 이상으로 정해 주세요.')
    if (next !== confirm) return setError('새 비밀번호 두 칸이 서로 달라요.')
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(ADMIN_EMAIL, current))
    } catch {
      return setError('지금 비밀번호가 맞지 않아요.')
    }
    try {
      await updatePassword(user, next)
    } catch {
      return setError('비밀번호를 바꾸지 못했어요. 다시 해 주세요.')
    }
    setError('')
    setCurrent('')
    setNext('')
    setConfirm('')
    setNote('비밀번호를 바꿨어요. 모든 기기에서 새 비밀번호를 써야 해요.')
  }

  return (
    <article className="panel live-section">
      <div className="live-head">
        <div>
          <h2>비밀번호 바꾸기</h2>
          <p>바꾸면 모든 운영진 기기에 바로 적용돼요.</p>
        </div>
      </div>
      <form className="live-id-fields" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <label>지금 비밀번호<input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" /></label>
        <label>새 비밀번호 (6글자 이상)<input type="password" value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" /></label>
        <label>새 비밀번호 한 번 더<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" /></label>
        <div className="live-id-action"><button className="primary-button" type="submit">비밀번호 바꾸기</button></div>
      </form>
      {error && <p className="live-error" role="alert">{error}</p>}
      {note && <p className="live-message" role="status">{note}</p>}
    </article>
  )
}
