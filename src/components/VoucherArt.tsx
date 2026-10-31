/**
 * 교사 관리 파일: 모바일 교환권 위에 보이는 그림. 메뉴 이름에 맞춰 팝콘·음료·선물 상자 중 하나를 보여 주고,
 * 사용한 교환권에는 "사용 완료" 도장을 찍습니다. 직접 그린 그림이라 저작권 걱정이 없습니다.
 */
type Kind = 'popcorn' | 'cup' | 'gift'

function kindOf(menuName: string): Kind {
  if (/팝콘|콘/.test(menuName)) return 'popcorn'
  if (/음료|주스|차$|물|콜라|사이다|에이드|커피|우유|라떼|탄산/.test(menuName)) return 'cup'
  return 'gift'
}

function Popcorn() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs><clipPath id="bucket-clip"><polygon points="30,58 90,58 82,110 38,110" /></clipPath></defs>
      <g fill="#fff3c4" stroke="#f0c96a" strokeWidth="2">
        <circle cx="38" cy="42" r="15" /><circle cx="60" cy="30" r="18" /><circle cx="83" cy="42" r="15" />
        <circle cx="50" cy="50" r="14" /><circle cx="72" cy="50" r="14" />
      </g>
      <g fill="#f4a93b"><circle cx="46" cy="34" r="2.5" /><circle cx="68" cy="24" r="2.5" /><circle cx="84" cy="38" r="2.5" /><circle cx="58" cy="46" r="2.5" /></g>
      <polygon points="30,58 90,58 82,110 38,110" fill="#fff" />
      <g clipPath="url(#bucket-clip)" fill="#df5d48"><rect x="30" y="58" width="10" height="52" /><rect x="50" y="58" width="10" height="52" /><rect x="70" y="58" width="10" height="52" /></g>
      <polygon points="30,58 90,58 82,110 38,110" fill="none" stroke="#c94d3a" strokeWidth="2" strokeLinejoin="round" />
      <rect x="26" y="54" width="68" height="9" rx="4" fill="#df5d48" stroke="#c94d3a" strokeWidth="2" />
      <circle cx="53" cy="84" r="3" fill="#2b211d" /><circle cx="67" cy="84" r="3" fill="#2b211d" />
      <path d="M54 92 Q60 98 66 92" fill="none" stroke="#2b211d" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Cup() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="64" y="8" width="7" height="40" rx="3" fill="#df5d48" transform="rotate(12 67 28)" />
      <polygon points="32,44 88,44 80,108 40,108" fill="#bfe3f7" stroke="#5ea8d6" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="35,62 85,62 80,108 40,108" fill="#8ec5f0" />
      <rect x="28" y="38" width="64" height="9" rx="4" fill="#fff" stroke="#5ea8d6" strokeWidth="2" />
      <rect x="46" y="70" width="12" height="12" rx="3" fill="#fff" opacity=".75" /><rect x="62" y="80" width="12" height="12" rx="3" fill="#fff" opacity=".75" />
      <circle cx="53" cy="94" r="2.6" fill="#2b211d" /><circle cx="67" cy="94" r="2.6" fill="#2b211d" />
    </svg>
  )
}

function Gift() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="22" y="50" width="76" height="56" rx="6" fill="#fdd36a" stroke="#e1a92a" strokeWidth="2" />
      <rect x="16" y="38" width="88" height="18" rx="5" fill="#ffe08f" stroke="#e1a92a" strokeWidth="2" />
      <rect x="54" y="38" width="12" height="68" fill="#df5d48" />
      <path d="M60 38 C44 18 28 24 38 34 C44 40 56 38 60 38 Z M60 38 C76 18 92 24 82 34 C76 40 64 38 60 38 Z" fill="#df5d48" stroke="#c94d3a" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function VoucherArt({ menuName, status }: { menuName: string; status: 'issued' | 'used' | 'cancelled' }) {
  const kind = kindOf(menuName)
  return (
    <div className={`voucher-art ${kind}`}>
      {kind === 'popcorn' ? <Popcorn /> : kind === 'cup' ? <Cup /> : <Gift />}
      <p className="voucher-brand">배정 팝팝스토어</p>
      {status !== 'issued' && <span className="voucher-stamp">{status === 'used' ? <>사용<br />완료</> : <>취소<br />됨</>}</span>}
    </div>
  )
}
