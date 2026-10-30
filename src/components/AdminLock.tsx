import { useState } from 'react'

/**
 * 교사 관리 파일: 운영진 화면 비밀번호 잠금.
 * 저장소가 공개라서 비밀번호 자체는 넣지 않고 SHA-256 변환값만 넣습니다.
 * 비밀번호 바꾸는 법: 터미널에서 아래 명령의 '새비밀번호'만 바꿔 실행하고, 나온 값을 ADMIN_PASSWORD_SHA256에 붙여 넣습니다.
 *   node -e "console.log(require('crypto').createHash('sha256').update('새비밀번호').digest('hex'))"
 * 주의: 서버가 없는 화면 잠금이라 코드를 아는 사람은 우회할 수 있습니다. 실제 운영 보안은 서버에서 해야 합니다.
 */
export const ADMIN_PASSWORD_SHA256 = '92b0aed005fd3b8e71a409421b78c077bfd73f6730846bcacf6ecf157ce2239a'

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function AdminLock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    if ((await sha256(password)) === ADMIN_PASSWORD_SHA256) {
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
