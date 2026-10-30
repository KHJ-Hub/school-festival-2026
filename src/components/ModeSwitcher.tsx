export type AppMode = 'student' | 'admin' | 'ranking'

type ModeSwitcherProps = {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher" aria-label="화면 선택">
      <button className={mode === 'student' ? 'active' : ''} onClick={() => onChange('student')}>학생용</button>
      <button className={mode === 'admin' ? 'active' : ''} onClick={() => onChange('admin')}>운영진용</button>
      <button className={mode === 'ranking' ? 'active' : ''} onClick={() => onChange('ranking')}>랭킹</button>
    </div>
  )
}
