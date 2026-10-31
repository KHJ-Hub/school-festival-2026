import type { ReactNode } from 'react'
import {
  StudentVoucherCard,
  calculateCoinBalance,
  calculateTotalEarned,
  canAffordMenu,
  createCoinRequest,
  findDemoStudent,
  findEnabledMenu,
  isDemoStudentId,
  issueVoucher,
  markVoucherUsed,
  rankByTotalEarned,
  resolveCoinRequest,
} from '../studentTasks'
import { DEMO_GRANTS, DEMO_MENUS, DEMO_REQUESTS, DEMO_STUDENTS, DEMO_VOUCHERS } from '../tasks/fixtures'
import './TaskPlayground.css'

/**
 * 교사 관리 파일: 학생이 구현한 함수를 가상 데이터로 실행해 결과를 보여 줍니다.
 * 사이트 주소 끝에 #lab 을 붙이면 열립니다. 축제 화면처럼 꾸미지 않고, 학생 함수가 돌려준 값과
 * 8번 학생의 교환권 카드를 원래 모습 그대로 보여 줍니다.
 * 학생 코드에서 오류가 나도 이 화면 전체가 멈추지 않도록 항목마다 감쌉니다.
 */
function show(run: () => unknown): string {
  try {
    const value = run()
    return value === undefined ? 'undefined' : JSON.stringify(value)
  } catch (error) {
    return `오류: ${error instanceof Error ? error.message : String(error)}`
  }
}

type Row = { label: string; result: string }

function Task({ no, title, rows, children }: { no: number; title: string; rows?: Row[]; children?: ReactNode }) {
  return (
    <article className="playground-task">
      <h3><span>{no}번</span>{title}</h3>
      {rows && (
        <dl>
          {rows.map((row) => (
            <div key={row.label}><dt>{row.label}</dt><dd>{row.result}</dd></div>
          ))}
        </dl>
      )}
      {children}
    </article>
  )
}

export function TaskPlayground() {
  const bag = DEMO_MENUS[1]!
  return (
    <section className="playground">
      <div>
        <span className="eyebrow">STUDENT CODE LAB</span>
        <h2>내가 만든 코드, 원래 모습</h2>
        <p>축제 사이트에서는 여러분이 만든 함수에 디자인을 입혀서 보여 줘요. 여기서는 연습용 가상 데이터(학번 9로 시작)로 함수를 실행해서 <b>함수가 돌려준 값 그대로</b> 보여 줘요. 8번 교환권 카드도 꾸미기 전 원래 모습이에요.</p>
        <p className="playground-note">아직 만드는 중인 함수는 처음에 받은 기본값(TODO)이 보여요.</p>
      </div>
      <div className="playground-grid">
        <Task no={1} title="학번 검사·학생 찾기·메뉴 조회" rows={[
          { label: "isDemoStudentId('90001')", result: show(() => isDemoStudentId('90001')) },
          { label: "isDemoStudentId('9000')", result: show(() => isDemoStudentId('9000')) },
          { label: "findDemoStudent(' 90002 ')", result: show(() => findDemoStudent(DEMO_STUDENTS, ' 90002 ')) },
          { label: "findEnabledMenu('popcorn-cup')", result: show(() => findEnabledMenu(DEMO_MENUS, 'popcorn-cup')?.name) },
          { label: "findEnabledMenu('popcorn-set')", result: show(() => findEnabledMenu(DEMO_MENUS, 'popcorn-set')?.name) },
          { label: "canAffordMenu(3, 정식 1봉지)", result: show(() => canAffordMenu(3, bag)) },
        ]} />
        <Task no={2} title="코인 적립 신청 만들기" rows={[
          { label: "createCoinRequest(90001, 3) 후 건수", result: show(() => { const r = createCoinRequest(DEMO_REQUESTS, '90001', 3); return { ok: r.ok, count: r.requests.length } }) },
          { label: "createCoinRequest(90003, 1) pending 있음", result: show(() => { const r = createCoinRequest(DEMO_REQUESTS, '90003', 1); return { ok: r.ok, message: r.message } }) },
          { label: "createCoinRequest(90001, 0) 잘못된 수량", result: show(() => { const r = createCoinRequest(DEMO_REQUESTS, '90001', 0); return { ok: r.ok, message: r.message } }) },
        ]} />
        <Task no={3} title="잔액·누적 적립" rows={[
          { label: "calculateCoinBalance(90001)", result: show(() => calculateCoinBalance('90001', DEMO_GRANTS, DEMO_VOUCHERS)) },
          { label: "calculateTotalEarned(90001)", result: show(() => calculateTotalEarned('90001', DEMO_GRANTS)) },
        ]} />
        <Task no={4} title="적립 승인·거절 처리" rows={[
          { label: "resolveCoinRequest('r-3', approve)", result: show(() => { const r = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, 'r-3', 'approve'); return { ok: r.ok, grants: r.grants.length } }) },
          { label: "resolveCoinRequest('r-3', reject)", result: show(() => { const r = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, 'r-3', 'reject'); return { ok: r.ok, grants: r.grants.length } }) },
          { label: "resolveCoinRequest('r-1', approve) 이미 처리", result: show(() => { const r = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, 'r-1', 'approve'); return { ok: r.ok, message: r.message } }) },
        ]} />
        <Task no={5} title="교환권 발급" rows={[
          { label: "issueVoucher(90001, 정식 1봉지, 잔액 5)", result: show(() => { const r = issueVoucher(DEMO_VOUCHERS, '90001', bag, 5); return { ok: r.ok, message: r.message, count: r.vouchers.length } }) },
          { label: "issueVoucher(…, 잔액 2)", result: show(() => { const r = issueVoucher(DEMO_VOUCHERS, '90001', bag, 2); return { ok: r.ok, message: r.message, count: r.vouchers.length } }) },
        ]} />
        <Task no={6} title="교환권 사용 처리" rows={[
          { label: "markVoucherUsed('v-1')", result: show(() => { const r = markVoucherUsed(DEMO_VOUCHERS, 'v-1'); return { ok: r.ok, message: r.message } }) },
          { label: "markVoucherUsed('v-2') 이미 사용", result: show(() => { const r = markVoucherUsed(DEMO_VOUCHERS, 'v-2'); return { ok: r.ok, message: r.message } }) },
          { label: "markVoucherUsed('v-3') 취소됨", result: show(() => { const r = markVoucherUsed(DEMO_VOUCHERS, 'v-3'); return { ok: r.ok, message: r.message } }) },
        ]} />
        <Task no={7} title="누적 코인 랭킹" rows={[
          { label: "rankByTotalEarned(TOP 5)", result: show(() => rankByTotalEarned(DEMO_GRANTS, 5).map((r) => `${r.rank}위 ${r.studentId.slice(0, 3)}** ${r.total}`)) },
        ]} />
        <Task no={8} title="학생용 교환권 카드">
          <div className="playground-cards">
            {DEMO_VOUCHERS.map((voucher) => <StudentVoucherCard key={voucher.id} voucher={voucher} menuName={DEMO_MENUS.find((m) => m.id === voucher.menuId)?.name ?? '메뉴'} />)}
          </div>
        </Task>
      </div>
    </section>
  )
}
