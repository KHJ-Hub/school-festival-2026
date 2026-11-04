import { useState } from 'react'

/**
 * 교사 관리 파일: 운영진 화면 카드 접기/펼치기.
 * 폰에서는 처음에 접어 두고(openOnPhone이면 펼침), PC에서는 펼쳐 둡니다. 한 번 바꾸면 이 기기에 기억합니다.
 */
export function useFold(key: string, openOnPhone = false): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(`fold-${key}`)
      if (saved) return saved === 'open'
    } catch {
      // 저장이 안 되는 브라우저는 기본값으로 엽니다.
    }
    return openOnPhone || !window.matchMedia('(max-width: 600px)').matches
  })
  const change = (next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(`fold-${key}`, next ? 'open' : 'closed')
    } catch {
      // 기억 못 해도 지금 화면에서는 접히고 펼쳐집니다.
    }
  }
  return [open, change]
}

export function FoldButton({ open, onToggle }: { open: boolean; onToggle: (open: boolean) => void }) {
  return <button type="button" className="live-toggle" onClick={() => onToggle(!open)} aria-expanded={open}>{open ? '접기' : '펼치기'}</button>
}
