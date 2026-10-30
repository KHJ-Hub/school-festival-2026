import { useState } from 'react'

/**
 * 교사 관리 파일: 운영진 화면 비밀번호 잠금.
 * 저장소가 공개라서 비밀번호 자체는 넣지 않고 SHA-256 변환값만 넣습니다.
 * 운영진 화면의 "비밀번호 바꾸기"로 바꾼 비밀번호는 그 기기(브라우저)에만 저장됩니다.
 * 모든 기기의 기본 비밀번호를 바꾸려면: 터미널에서 아래 명령의 '새비밀번호'만 바꿔 실행하고, 나온 값을 ADMIN_PASSWORD_SHA256에 붙여 넣습니다.
 *   node -e "console.log(require('crypto').createHash('sha256').update('새비밀번호').digest('hex'))"
 * 주의: 서버가 없는 화면 잠금이라 코드를 아는 사람은 우회할 수 있습니다. 실제 운영 보안은 서버에서 해야 합니다.
 */
export const ADMIN_PASSWORD_SHA256 = '92b0aed005fd3b8e71a409421b78c077bfd73f6730846bcacf6ecf157ce2239a'

const STORAGE_KEY = 'festival-admin-password-sha256'

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** 이 기기에서 바꾼 비밀번호가 있으면 그것을, 없으면 기본값을 씁니다. 저장소를 못 쓰는 브라우저면 기본값. */
function currentHash(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ADMIN_PASSWORD_SHA256
  } catch {
    return ADMIN_PASSWORD_SHA256
  }
}

/** 운영진 화면 안에서 비밀번호 바꾸기. 지금 비밀번호를 맞혀야 바꿀 수 있습니다. */
export function AdminPasswordChange() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setNote('')
    if ((await sha256(current)) !== currentHash()) return setError('지금 비밀번호가 맞지 않아요.')
    if (next.length < 6) return setError('새 비밀번호는 6글자 이상으로 정해 주세요.')
    if (next !== confirm) return setError('새 비밀번호 두 칸이 서로 달라요.')
    try {
      localStorage.setItem(STORAGE_KEY, await sha256(next))
    } catch {
      return setError('이 브라우저에서는 비밀번호를 저장할 수 없어요. (시크릿 창이면 일반 창에서 해 주세요)')
    }
    setError('')
    setCurrent('')
    setNext('')
    setConfirm('')
    setNote('비밀번호를 바꿨어요. 이 기기에서만 적용돼요.')
  }

  return (
    <article className="panel live-section">
      <div className="live-head">
        <div>
          <h2>비밀번호 바꾸기</h2>
          <p>바꾼 비밀번호는 이 기기(브라우저)에만 저장돼요. 다른 기기는 원래 비밀번호를 써요.</p>
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

export function AdminLock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    if ((await sha256(password)) === currentHash()) {
      setError('')
      setPassword('')
      onUnlock()
    } else {
      setError('비밀번호가 맞지 않아요.')
    }
  }

  return (
    <section className="panel live-id admin-lock">
      <form className="live-id-fields" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <label>
          운영진 비밀번호
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        <div className="live-id-action">
          <button className="primary-button" type="submit">잠금 풀기 <span>→</span></button>
        </div>
      </form>
      {error && <p className="live-error" role="alert">{error}</p>}
    </section>
  )
}
