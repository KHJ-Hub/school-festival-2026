import { useEffect, useRef, useState } from 'react'
import { countIssuedByMenu, newMenuId, saveMenus, useMenus, type StoreMenu, type StoredVoucher } from '../data/store'

/**
 * 교사 관리 파일: 운영진 화면의 간식 메뉴 관리(품절 처리, 수량, 추가, 삭제).
 * 품절(enabled: false)이면 학생 화면에서 교환할 수 없고, 보안 규칙도 품절 메뉴 교환권을 막습니다.
 * 수량(stock)을 정하면 그만큼 교환권이 발급됐을 때 운영진 기기가 자동으로 품절 처리합니다.
 * 메뉴를 지워도 이미 발급된 교환권은 그대로 남고, 교환권에 저장된 메뉴 이름으로 보입니다.
 */
export function AdminMenus({ vouchers, vouchersLoaded }: { vouchers: StoredVoucher[]; vouchersLoaded: boolean }) {
  const { menus, status } = useMenus()
  const [name, setName] = useState('')
  const [cost, setCost] = useState(1)
  const [stock, setStock] = useState('')
  const [note, setNote] = useState('')
  const issued = countIssuedByMenu(vouchers)

  // 알림 문구는 4초 뒤 사라집니다(자리 차지하지 않게).
  useEffect(() => {
    if (!note) return
    const timer = window.setTimeout(() => setNote(''), 4000)
    return () => window.clearTimeout(timer)
  }, [note])

  // Firebase에 메뉴가 정말 없을 때만(서버에서 확인한 뒤) 기본 메뉴로 한 번 채워 둡니다.
  // 읽는 중('loading')에 저장하면 운영진이 바꾼 메뉴를 기본값으로 덮어써 버리므로 하지 않습니다.
  useEffect(() => {
    if (status === 'missing') void saveMenus(menus).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const save = async (next: StoreMenu[], done: string) => {
    if (status !== 'ready') {
      setNote('메뉴를 불러오는 중이에요. 잠시 뒤 다시 눌러 주세요.')
      return
    }
    try {
      await saveMenus(next)
      setNote(done)
    } catch {
      setNote('저장하지 못했어요. 인터넷 연결을 확인해 주세요.')
    }
  }

  /** 수량 입력 창을 띄워 새 수량을 받습니다. 빈칸이면 제한 없음(undefined), 취소하면 null. */
  const askStock = (menu: StoreMenu, message: string): number | undefined | null => {
    const answer = window.prompt(message, menu.stock !== undefined ? String(menu.stock) : '')
    if (answer === null) return null
    if (answer.trim() === '') return undefined
    const value = Number(answer.trim())
    if (!Number.isInteger(value) || value < 1) {
      setNote('수량은 1 이상의 정수로 써 주세요.')
      return null
    }
    return value
  }

  const changeStock = (menu: StoreMenu) => {
    const used = issued[menu.id] ?? 0
    const value = askStock(menu, `"${menu.name}" 교환 수량 (지금까지 ${used}개 발급)\n빈칸으로 두면 수량 제한이 없어요.`)
    if (value === null) return
    void save(menus.map((item) => (item.id === menu.id ? { ...item, stock: value } : item)), value === undefined ? `${menu.name} 수량 제한을 없앴어요.` : `${menu.name} 수량을 ${value}개로 정했어요.`)
  }

  const toggle = (menu: StoreMenu) => {
    if (menu.enabled) {
      void save(menus.map((item) => (item.id === menu.id ? { ...item, enabled: false } : item)), `${menu.name}을(를) 품절로 바꿨어요.`)
      return
    }
    // 수량이 다 차서 품절된 메뉴는 수량을 늘려야 다시 팔 수 있습니다(안 늘리면 바로 다시 품절되므로).
    const used = issued[menu.id] ?? 0
    let nextStock = menu.stock
    if (menu.stock !== undefined && used >= menu.stock) {
      const value = askStock(menu, `"${menu.name}"은(는) ${used}개가 이미 발급돼 수량(${menu.stock}개)이 다 찼어요.\n몇 개까지 발급할까요? (${used}보다 크게, 빈칸이면 제한 없음)`)
      if (value === null) return
      if (value !== undefined && value <= used) {
        setNote(`수량을 ${used}개보다 크게 정해야 다시 팔 수 있어요.`)
        return
      }
      nextStock = value
    }
    void save(menus.map((item) => (item.id === menu.id ? { ...item, enabled: true, stock: nextStock } : item)), `${menu.name}을(를) 다시 판매해요.`)
  }

  const remove = (menu: StoreMenu) => {
    if (!window.confirm(`"${menu.name}" 메뉴를 지울까요? 이미 받은 교환권은 그대로 남아요.`)) return
    void save(menus.filter((item) => item.id !== menu.id), `${menu.name}을(를) 지웠어요.`)
  }

  const add = () => {
    const value = name.trim()
    if (!value) return setNote('메뉴 이름을 써 주세요.')
    if (!Number.isInteger(cost) || cost < 1 || cost > 20) return setNote('필요한 코인은 1~20 사이 정수로 써 주세요.')
    const stockValue = stock.trim() === '' ? undefined : Number(stock)
    if (stockValue !== undefined && (!Number.isInteger(stockValue) || stockValue < 1)) return setNote('수량은 1 이상의 정수로 쓰거나 비워 두세요.')
    if (menus.some((menu) => menu.name === value)) return setNote('같은 이름의 메뉴가 이미 있어요.')
    void save([...menus, { id: newMenuId(), name: value, cost, enabled: true, stock: stockValue }], `${value} 메뉴를 추가했어요.`)
    setName('')
    setCost(1)
    setStock('')
  }

  return (
    <article className="panel live-section admin-roster">
      <div className="live-head">
        <div>
          <h2>간식 메뉴</h2>
          <p>품절로 바꾸면 학생 화면에서 바로 "품절"로 보이고 교환할 수 없어요. 수량을 정하면 그만큼 발급됐을 때 자동으로 품절되고, 수량을 비워 두면 제한 없이 팔아요.</p>
        </div>
      </div>

      {note && <p className="live-message" role="status">{note}</p>}

      <ul className="live-list">
        {menus.map((menu) => {
          const used = issued[menu.id] ?? 0
          return (
            <li key={menu.id} className={menu.enabled ? '' : 'sold-out'}>
              <span>
                {menu.name} · {menu.cost} coin · <b className={`live-status ${menu.enabled ? 'approved' : 'rejected'}`}>{menu.enabled ? '판매 중' : '품절'}</b>
                <small className="menu-stock">{vouchersLoaded ? (menu.stock !== undefined ? `발급 ${used} / ${menu.stock}개` : `발급 ${used}개 · 수량 제한 없음`) : '발급 수 읽는 중'}</small>
              </span>
              <span className="live-buttons">
                <button onClick={() => toggle(menu)}>{menu.enabled ? '품절 처리' : '다시 판매'}</button>
                <button onClick={() => changeStock(menu)}>수량</button>
                <button className="ghost" onClick={() => remove(menu)}>삭제</button>
              </span>
            </li>
          )
        })}
      </ul>

      <h3>메뉴 추가</h3>
      <div className="live-row">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="메뉴 이름" aria-label="메뉴 이름" maxLength={20} />
        <input type="number" min={1} max={20} value={cost} onChange={(event) => setCost(Number(event.target.value))} aria-label="필요한 코인" />
        <input type="number" min={1} value={stock} onChange={(event) => setStock(event.target.value)} placeholder="수량" aria-label="교환 수량" />
        <button className="primary-button" onClick={add}>메뉴 추가</button>
      </div>
    </article>
  )
}

/**
 * 운영진이 로그인해 있는 동안 계속 돌면서, 수량만큼 교환권이 발급된 메뉴를 자동으로 품절 처리합니다.
 * 메뉴와 교환권을 서버에서 다 읽은 뒤에만 저장합니다(읽기 전 값으로 덮어쓰지 않도록).
 */
export function AdminStockSync({ vouchers, vouchersLoaded }: { vouchers: StoredVoucher[]; vouchersLoaded: boolean }) {
  const { menus, status } = useMenus()
  const saving = useRef(false)

  useEffect(() => {
    if (status !== 'ready' || !vouchersLoaded || saving.current) return
    const issued = countIssuedByMenu(vouchers)
    const full = menus.filter((menu) => menu.enabled && menu.stock !== undefined && (issued[menu.id] ?? 0) >= menu.stock)
    if (full.length === 0) return
    saving.current = true
    void saveMenus(menus.map((menu) => (full.includes(menu) ? { ...menu, enabled: false } : menu)))
      .catch(() => undefined)
      .finally(() => { saving.current = false })
  }, [menus, status, vouchers, vouchersLoaded])

  return null
}
