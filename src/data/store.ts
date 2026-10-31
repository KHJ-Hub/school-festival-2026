import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { normalizeForCheck, type Account, type RosterEntry } from '../components/nicknameRules'
import { DEMO_MENUS } from '../tasks/fixtures'
import type { CoinGrant, CoinRequest, SnackMenu, TaskVoucher } from '../tasks/taskTypes'

/**
 * 교사 관리 파일: Firestore에 읽고 쓰는 함수 모음. 화면(App, FestivalLive)은 여기만 부릅니다.
 *
 * 저장 구조 (보안 규칙은 firestore.rules)
 *   roster/{학번}                     { name }                         운영진만
 *   accounts/{학번}                   { uid, name, nickname, nicknameKey } 본인·운영진
 *   nicknames/{닉네임키}              { studentId, uid }               중복 확인용
 *   students/{학번}/requests/{id}     코인 신청                         본인·운영진
 *   students/{학번}/grants/{id}       지급 내역                         본인 읽기·운영진
 *   students/{학번}/vouchers/{코드}   교환권(코드 = 바코드 값)           본인·운영진
 *   public/ranking                    { rows: [{ rank, nickname, total }] } 모두 읽기
 *   settings/bannedWords              { words: [] }                    모두 읽기·운영진
 *   settings/menus                    { items: { 메뉴id: { name, cost, enabled, order } } } 모두 읽기·운영진
 */

export type RankingRow = { rank: number; nickname: string; total: number }

/** 교환권에는 메뉴 이름도 같이 저장합니다(나중에 메뉴를 지워도 교환권에 이름이 남도록). */
export type StoredVoucher = TaskVoucher & { menuName?: string; usedAt?: Timestamp | null }

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** 바코드에 쓸 교환권 코드: 헷갈리는 글자(0, O, 1, I, L)를 뺀 8글자 */
export function newVoucherCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return [...bytes].map((byte) => CODE_CHARS[byte % CODE_CHARS.length]).join('')
}

/** 학번은 경로(students/{학번}/...)에 있으므로 문서에서 꺼내 붙입니다. */
function withStudent<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id, studentId: item.ref.parent.parent?.id ?? '' }) as T)
}

// ───── 학생 본인 데이터 ─────

export function useStudentData(studentId: string | null) {
  const [data, setData] = useState<{ requests: CoinRequest[]; grants: CoinGrant[]; vouchers: StoredVoucher[] }>({ requests: [], grants: [], vouchers: [] })
  useEffect(() => {
    setData({ requests: [], grants: [], vouchers: [] })
    if (!studentId) return
    const base = ['students', studentId] as const
    const stop = [
      onSnapshot(collection(db, ...base, 'requests'), (snap) => setData((d) => ({ ...d, requests: withStudent<CoinRequest>(snap) })), () => undefined),
      onSnapshot(collection(db, ...base, 'grants'), (snap) => setData((d) => ({ ...d, grants: withStudent<CoinGrant>(snap) })), () => undefined),
      onSnapshot(collection(db, ...base, 'vouchers'), (snap) => setData((d) => ({ ...d, vouchers: withStudent<StoredVoucher>(snap) })), () => undefined),
    ]
    return () => stop.forEach((unsubscribe) => unsubscribe())
  }, [studentId])
  return data
}

// ───── 운영진 전체 데이터 ─────

export function useAdminData(enabled: boolean) {
  const empty = { requests: [] as CoinRequest[], grants: [] as CoinGrant[], vouchers: [] as StoredVoucher[], accounts: [] as Account[], roster: [] as RosterEntry[], grantsLoaded: false, vouchersLoaded: false, accountsLoaded: false }
  const [data, setData] = useState(empty)
  useEffect(() => {
    setData(empty)
    if (!enabled) return
    const stop = [
      onSnapshot(collectionGroup(db, 'requests'), (snap) => setData((d) => ({ ...d, requests: withStudent<CoinRequest>(snap) })), () => undefined),
      onSnapshot(collectionGroup(db, 'grants'), (snap) => setData((d) => ({ ...d, grants: withStudent<CoinGrant>(snap), grantsLoaded: true })), () => undefined),
      onSnapshot(collectionGroup(db, 'vouchers'), (snap) => setData((d) => ({ ...d, vouchers: withStudent<StoredVoucher>(snap), vouchersLoaded: true })), () => undefined),
      onSnapshot(collection(db, 'accounts'), (snap) => setData((d) => ({ ...d, accounts: snap.docs.map((item) => ({ studentId: item.id, name: item.data().name, nickname: item.data().nickname })), accountsLoaded: true })), () => undefined),
      onSnapshot(collection(db, 'roster'), (snap) => setData((d) => ({ ...d, roster: snap.docs.map((item) => ({ studentId: item.id, name: item.data().name })) })), () => undefined),
    ]
    return () => stop.forEach((unsubscribe) => unsubscribe())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
  return data
}

// ───── 모두 읽는 데이터 ─────

export function useRanking(): RankingRow[] {
  return useRankingState().rows
}

/** 랭킹과 함께 "서버에서 한 번이라도 읽었는지"를 돌려줍니다(읽기 전 빈 값으로 덮어쓰지 않으려고). */
export function useRankingState(): { rows: RankingRow[]; loaded: boolean } {
  const [state, setState] = useState<{ rows: RankingRow[]; loaded: boolean }>({ rows: [], loaded: false })
  useEffect(() => onSnapshot(doc(db, 'public', 'ranking'), (snap) => setState({ rows: (snap.data()?.rows as RankingRow[]) ?? [], loaded: true }), () => setState({ rows: [], loaded: false })), [])
  return state
}

type MenuDoc = { name: string; cost: number; enabled: boolean; order: number; stock?: number | null }

/** 운영진 메뉴: stock은 이 메뉴로 발급할 수 있는 교환권 전체 수량(없으면 제한 없음). */
export type StoreMenu = SnackMenu & { stock?: number }

/**
 * 간식 메뉴(운영진이 추가·삭제·품절 처리). enabled가 false면 품절이라 교환권으로 바꿀 수 없습니다.
 * status: 'loading' = 아직 서버에서 못 읽음, 'missing' = 서버에 메뉴가 정말 없음, 'ready' = 읽음.
 * 읽기 전·없을 때는 화면에 기본 메뉴(fixtures)를 보여 줍니다. 기본 메뉴를 저장하는 일은 'missing'일 때만 합니다.
 */
export function useMenus(): { menus: StoreMenu[]; ready: boolean; status: 'loading' | 'missing' | 'ready' } {
  const [state, setState] = useState<{ menus: StoreMenu[]; status: 'loading' | 'missing' | 'ready' }>({ menus: DEMO_MENUS, status: 'loading' })
  useEffect(() => onSnapshot(doc(db, 'settings', 'menus'), (snap) => {
    const items = snap.data()?.items as Record<string, MenuDoc> | undefined
    if (!items) {
      // 인터넷이 끊겨 기기 안의 임시 값만 본 경우(fromCache)는 "없음"으로 판단하지 않습니다.
      if (!snap.metadata.fromCache) setState({ menus: DEMO_MENUS, status: 'missing' })
      return
    }
    const menus = Object.entries(items)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id, item]) => ({ id, name: item.name, cost: item.cost, enabled: item.enabled, ...(typeof item.stock === 'number' ? { stock: item.stock } : {}) }))
    setState({ menus, status: 'ready' })
  }, () => setState((current) => ({ ...current, status: current.status === 'ready' ? 'ready' : 'loading' }))), [])
  return { menus: state.menus, ready: state.status === 'ready', status: state.status }
}

export async function saveMenus(menus: StoreMenu[]): Promise<void> {
  const items = Object.fromEntries(menus.map((menu, order) => [menu.id, { name: menu.name, cost: menu.cost, enabled: menu.enabled, order, stock: menu.stock ?? null }]))
  await setDoc(doc(db, 'settings', 'menus'), { items })
}

/** 메뉴별로 지금까지 발급된 교환권 수(사용한 것 포함, 취소된 것 제외). */
export function countIssuedByMenu(vouchers: StoredVoucher[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const voucher of vouchers) {
    if (voucher.status !== 'cancelled') counts[voucher.menuId] = (counts[voucher.menuId] ?? 0) + 1
  }
  return counts
}

export function newMenuId(): string {
  return `menu-${Date.now().toString(36)}`
}

export function useBannedWords(): string[] {
  return useBannedWordsState().words
}

/** 금지어와 함께 "서버에서 읽었는지"를 돌려줍니다(읽기 전에 추가하면 기존 금지어를 덮어쓰므로). */
export function useBannedWordsState(): { words: string[]; loaded: boolean } {
  const [state, setState] = useState<{ words: string[]; loaded: boolean }>({ words: [], loaded: false })
  useEffect(() => onSnapshot(doc(db, 'settings', 'bannedWords'), (snap) => {
    if (!snap.exists() && snap.metadata.fromCache) return
    setState({ words: (snap.data()?.words as string[]) ?? [], loaded: true })
  }, () => setState((current) => ({ ...current }))), [])
  return state
}

// ───── 학생 등록 / 다시 들어오기 / 닉네임 ─────

export type EnterOutcome = { ok: true; account: Account; kind: 'new' | 'reenter' } | { ok: false; message: string }

const ROSTER_MISMATCH = '명단에 없는 학번이거나 이름이 달라요. 운영진에게 물어보세요.'

/** 닉네임이 이미 쓰이는지: 없는 닉네임 문서만 읽을 수 있게 규칙을 만들어, 읽기가 막히면 "이미 있음"으로 봅니다. */
export async function isNicknameTaken(nickname: string, ownStudentId?: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'nicknames', normalizeForCheck(nickname)))
    return snap.exists() && snap.data().studentId !== ownStudentId
  } catch {
    return true
  }
}

/** checkNewNickname: 처음 등록할 때만 부르는 닉네임 검사(금지어·길이·중복). 문제가 있으면 안내 문구를 돌려줍니다. */
export async function enterStudent(
  input: { studentId: string; name: string; nickname: string },
  checkNewNickname: (nickname: string) => Promise<string | null>,
): Promise<EnterOutcome> {
  const uid = auth.currentUser?.uid
  if (!uid) return { ok: false, message: '연결 중이에요. 잠시 뒤 다시 눌러 주세요.' }
  const { studentId, name, nickname } = input
  const accountRef = doc(db, 'accounts', studentId)

  // 1) 이미 등록된 학번인지: 없는 계정·내 계정만 읽을 수 있고, 남의 계정은 읽기가 막힙니다.
  let registeredByOther = false
  try {
    const snap = await getDoc(accountRef)
    if (snap.exists()) {
      const data = snap.data()
      if (data.name !== name) return { ok: false, message: ROSTER_MISMATCH }
      return { ok: true, kind: 'reenter', account: { studentId, name: data.name, nickname: data.nickname } }
    }
  } catch {
    registeredByOther = true
  }

  // 2) 다시 들어오기: 다른 기기에서 등록한 학번 → 학번·이름이 명단과 맞으면 이 기기로 옮깁니다(규칙이 이름 확인).
  if (registeredByOther) {
    try {
      // 학번·이름 확인서(claims)를 만들고 같은 요청에서 계정을 이 기기로 옮깁니다. 이름이 틀리면 규칙이 둘 다 막습니다.
      const claimRef = doc(collection(db, 'claims'))
      const batch = writeBatch(db)
      batch.set(claimRef, { studentId, name, uid })
      batch.update(accountRef, { uid, claimId: claimRef.id })
      await batch.commit()
      const data = (await getDoc(accountRef)).data()!
      await updateDoc(doc(db, 'nicknames', data.nicknameKey), { uid })
      return { ok: true, kind: 'reenter', account: { studentId, name: data.name, nickname: data.nickname } }
    } catch {
      return { ok: false, message: ROSTER_MISMATCH }
    }
  }

  // 3) 처음 등록: 계정과 닉네임 문서를 한 번에 만듭니다(닉네임이 동시에 겹치면 한쪽만 성공).
  const problem = await checkNewNickname(nickname)
  if (problem) return { ok: false, message: problem }
  const nicknameKey = normalizeForCheck(nickname)
  const batch = writeBatch(db)
  batch.set(accountRef, { uid, name, nickname, nicknameKey })
  batch.set(doc(db, 'nicknames', nicknameKey), { studentId, uid })
  try {
    await batch.commit()
    return { ok: true, kind: 'new', account: { studentId, name, nickname } }
  } catch {
    if (await isNicknameTaken(nickname, studentId)) return { ok: false, message: '이미 다른 학생이 쓰는 닉네임이에요. 다른 닉네임을 정해 주세요.' }
    return { ok: false, message: ROSTER_MISMATCH }
  }
}

/** 이 기기에 저장해 둔 학번이 여전히 내 계정인지 확인합니다(새로고침 후 자동으로 들어오기). */
export async function loadOwnAccount(studentId: string): Promise<Account | null> {
  try {
    const snap = await getDoc(doc(db, 'accounts', studentId))
    if (!snap.exists() || snap.data().uid !== auth.currentUser?.uid) return null
    return { studentId, name: snap.data().name, nickname: snap.data().nickname }
  } catch {
    return null
  }
}

export async function renameStudent(account: Account, nickname: string): Promise<string | null> {
  const uid = auth.currentUser?.uid
  if (!uid) return '연결 중이에요. 잠시 뒤 다시 눌러 주세요.'
  const oldKey = normalizeForCheck(account.nickname)
  const newKey = normalizeForCheck(nickname)
  if (oldKey === newKey) {
    await updateDoc(doc(db, 'accounts', account.studentId), { nickname, nicknameKey: newKey })
    return null
  }
  const batch = writeBatch(db)
  batch.set(doc(db, 'nicknames', newKey), { studentId: account.studentId, uid })
  batch.delete(doc(db, 'nicknames', oldKey))
  batch.update(doc(db, 'accounts', account.studentId), { nickname, nicknameKey: newKey })
  try {
    await batch.commit()
    return null
  } catch {
    return (await isNicknameTaken(nickname, account.studentId)) ? '이미 다른 학생이 쓰는 닉네임이에요. 다른 닉네임을 정해 주세요.' : '닉네임을 바꾸지 못했어요. 다시 해 주세요.'
  }
}

// ───── 학생 쓰기: 신청, 교환권 ─────

/** 2번 학생 함수가 만든 새 신청을 저장합니다(번호는 겹치지 않게 Firestore가 새로 정함). */
export async function saveNewRequest(studentId: string, request: CoinRequest): Promise<void> {
  const ref = doc(collection(db, 'students', studentId, 'requests'))
  await setDoc(ref, { claimedAmount: request.claimedAmount, status: 'pending', uid: auth.currentUser?.uid ?? '' })
}

/** 5번 학생 함수가 만든 새 교환권을 저장합니다(바코드 코드를 새로 정함). 저장된 코드를 돌려줍니다. */
export async function saveNewVoucher(studentId: string, voucher: TaskVoucher, menuName: string): Promise<string> {
  const code = newVoucherCode()
  await setDoc(doc(db, 'students', studentId, 'vouchers', code), { menuId: voucher.menuId, menuName, cost: voucher.cost, status: 'issued', uid: auth.currentUser?.uid ?? '' })
  return code
}

// ───── 운영진 쓰기 ─────

/** 4번 학생 함수의 승인/거절 결과에서 바뀐 신청과 새 지급만 저장합니다. */
export async function saveResolution(before: { requests: CoinRequest[]; grants: CoinGrant[] }, after: { requests: CoinRequest[]; grants: CoinGrant[] }): Promise<void> {
  const batch = writeBatch(db)
  for (const request of after.requests) {
    const old = before.requests.find((item) => item.id === request.id)
    if (old && (old.status !== request.status || old.approvedAmount !== request.approvedAmount)) {
      batch.update(doc(db, 'students', request.studentId, 'requests', request.id), {
        status: request.status,
        ...(request.approvedAmount !== undefined ? { approvedAmount: request.approvedAmount } : {}),
      })
    }
  }
  for (const grant of after.grants.filter((item) => !before.grants.some((old) => old.id === item.id))) {
    batch.set(doc(collection(db, 'students', grant.studentId, 'grants')), { requestId: grant.requestId, amount: grant.amount })
  }
  await batch.commit()
}

/** 운영진이 학번으로 코인을 바로 지급합니다(알바 보상 등). 신청 없이 지급이라 requestId는 'direct'로 표시합니다. */
export type DirectGrant = CoinGrant & { note?: string; at?: Timestamp | null }

export async function grantCoinsDirect(studentId: string, amount: number, note: string): Promise<void> {
  await addDoc(collection(db, 'students', studentId, 'grants'), { requestId: 'direct', amount, note, at: serverTimestamp() })
}

/** 잘못 지급했을 때 직접 지급 기록 하나를 지웁니다(신청으로 받은 코인은 지울 수 없게 화면에서 막아 둠). */
export async function cancelDirectGrant(studentId: string, grantId: string): Promise<void> {
  await deleteDoc(doc(db, 'students', studentId, 'grants', grantId))
}

/** 6번 학생 함수의 사용 처리 결과에서 상태가 바뀐 교환권만 저장합니다. */
export async function saveVoucherUse(before: TaskVoucher[], after: TaskVoucher[]): Promise<void> {
  const batch = writeBatch(db)
  for (const voucher of after) {
    const old = before.find((item) => item.id === voucher.id)
    // 사용 처리한 시각(서버 시계)을 같이 남겨 운영진 화면의 "최근 스캔 기록"에 씁니다.
    if (old && old.status !== voucher.status) batch.update(doc(db, 'students', voucher.studentId, 'vouchers', voucher.id), { status: voucher.status, ...(voucher.status === 'used' ? { usedAt: serverTimestamp() } : {}) })
  }
  await batch.commit()
}

export async function saveRanking(rows: RankingRow[]): Promise<void> {
  await setDoc(doc(db, 'public', 'ranking'), { rows })
}

export async function saveRoster(entries: RosterEntry[]): Promise<void> {
  const batch = writeBatch(db)
  entries.forEach((entry) => batch.set(doc(db, 'roster', entry.studentId), { name: entry.name }))
  await batch.commit()
}

export async function removeRoster(studentId: string): Promise<void> {
  await deleteDoc(doc(db, 'roster', studentId))
}

/**
 * 연습·테스트에 쓴 학번의 기록을 모두 지웁니다(운영진이 버튼을 눌러 확인한 뒤에만).
 * 명단, 계정, 닉네임, 코인 신청·지급, 교환권을 지우고 지운 문서 수를 돌려줍니다.
 * claims(다시 들어오기 확인서)는 보안 규칙상 지울 수 없어 남지만, 명단에서 빠지면 쓰이지 않습니다.
 */
export async function removeStudentRecords(studentId: string): Promise<number> {
  const batch = writeBatch(db)
  let count = 0
  for (const sub of ['requests', 'grants', 'vouchers']) {
    const snap = await getDocs(collection(db, 'students', studentId, sub))
    snap.docs.forEach((item) => { batch.delete(item.ref); count += 1 })
  }
  const account = await getDoc(doc(db, 'accounts', studentId))
  if (account.exists()) {
    const key = account.data().nicknameKey as string | undefined
    if (key) { batch.delete(doc(db, 'nicknames', key)); count += 1 }
    batch.delete(account.ref)
    count += 1
  }
  const roster = await getDoc(doc(db, 'roster', studentId))
  if (roster.exists()) { batch.delete(roster.ref); count += 1 }
  if (count > 0) await batch.commit()
  return count
}

export async function saveBannedWords(words: string[]): Promise<void> {
  await setDoc(doc(db, 'settings', 'bannedWords'), { words })
}
