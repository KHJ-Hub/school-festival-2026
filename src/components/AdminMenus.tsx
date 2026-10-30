import { useEffect, useState } from 'react'
import { newMenuId, saveMenus, useMenus } from '../data/store'
import type { SnackMenu } from '../tasks/taskTypes'

/**
 * 교사 관리 파일: 운영진 화면의 간식 메뉴 관리(품절 처리, 추가, 삭제).
 * 품절(enabled: false)이면 학생 화면에서 교환할 수 없고, 보안 규칙도 품절 메뉴 교환권을 막습니다.
 * 메뉴를 지워도 이미 발급된 교환권은 그대로 남고, 교환권에 저장된 메뉴 이름으로 보입니다.
 */
export function AdminMenus() {
  const { menus, ready } = useMenus()
  const [name, setName] = useState('')
  const [cost, setCost] = useState(1)
  const [note, setNote] = useState('')

  // Firebase에 메뉴가 아직 없으면 기본 메뉴(맛보기컵·정식 1봉지·대형 팩 세트)로 한 번 채워 둡니다.
  useEffect(() => {
    if (!ready) void saveMenus(menus).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const save = async (next: SnackMenu[], done: string) => {
    try {
      await saveMenus(next)
      setNote(done)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
    }
  }

  const toggle = (menu: SnackMenu) =>
    save(menus.map((item) => (item.id === menu.id ? { ...item, enabled: !item.enabled } : item)), menu.enabled ? `${menu.name}을(를) 품절로 바꿨어요.` : `${menu.name}을(를) 다시 판매해요.`)

  const remove = (menu: SnackMenu) => {
    if (!window.confirm(`"${menu.name}" 메뉴를 지울까요? 이미 받은 교환권은 그대로 남아요.`)) return
    void save(menus.filter((item) => item.id !== menu.id), `${menu.name}을(를) 지웠어요.`)
  }

  const add = () => {
    const value = name.trim()
    if (!value) return setNote('메뉴 이름을 써 주세요.')
    if (!Number.isInteger(cost) || cost < 1 || cost > 20) return setNote('필요한 코인은 1~20 사이 정수로 써 주세요.')
    if (menus.some((menu) => menu.name === value)) return setNote('같은 이름의 메뉴가 이미 있어요.')
    void save([...menus, { id: newMenuId(), name: value, cost, enabled: true }], `${value} 메뉴를 추가했어요.`)
    setName('')
    setCost(1)
  }

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>간식 메뉴</h2>
          <p>품절로 바꾸면 학생 화면에서 바로 "품절"로 보이고 교환할 수 없어요.</p>
        </div>
      </div>

      {note && <p className="live-message" role="status">{note}</p>}

      <ul className="live-list">
        {menus.map((menu) => (
          <li key={menu.id} className={menu.enabled ? '' : 'sold-out'}>
            <span>{menu.name} · {menu.cost} coin · <b className={`live-status ${menu.enabled ? 'approved' : 'rejected'}`}>{menu.enabled ? '판매 중' : '품절'}</b></span>
            <span className="live-buttons">
              <button onClick={() => void toggle(menu)}>{menu.enabled ? '품절 처리' : '다시 판매'}</button>
              <button className="ghost" onClick={() => remove(menu)}>삭제</button>
            </span>
          </li>
        ))}
      </ul>

      <h3>메뉴 추가</h3>
      <div className="live-row">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="메뉴 이름" aria-label="메뉴 이름" maxLength={20} />
        <input type="number" min={1} max={20} value={cost} onChange={(event) => setCost(Number(event.target.value))} aria-label="필요한 코인" />
        <button className="primary-button" onClick={add}>메뉴 추가</button>
      </div>
    </article>
  )
}
