export type AppMode = 'student' | 'admin'

type ModeSwitcherProps = {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher" aria-label="데모 화면 선택">
      <button className={mode === 'student' ? 'active' : ''} onClick={() => onChange('student')}>학생용</button>
      <button className={mode === 'admin' ? 'active' : ''} onClick={() => onChange('admin')}>운영진용</button>
    </div>
  )
}


