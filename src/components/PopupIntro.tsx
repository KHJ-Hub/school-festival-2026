import './PopupIntro.css'

/** 교사 관리 파일: 연합 부스 기획서(친환경 스마트 팝업스토어)의 안내 내용을 화면에 보여 줍니다. */
const STEPS = [
  { no: 1, title: '입장 & 코인 파밍', desc: '글로벌 OX 퀴즈를 통과하면 기본 코인을 받아요.', tone: 'green' },
  { no: 2, title: '5분 보드게임 배틀', desc: '게임으로 코인을 걸고 겨뤄요.', tone: 'orange' },
  { no: 3, title: '모바일 교환권 발급', desc: '모은 코인을 정산해 원하는 교환권으로 바꿔요.', tone: 'blue' },
  { no: 4, title: '친환경 팝콘 라운지', desc: '교환권으로 갓 튀긴 Non-GMO 팝콘을 받아요.', tone: 'green' },
  { no: 5, title: '실시간 랭킹 & 시크릿', desc: '랭킹에 이름이 오르고, 1위는 시크릿 박스 도전!', tone: 'purple' },
]

export function VisitorSteps() {
  return (
    <section className="popup-intro" aria-label="관람객 체험 단계">
      <details className="popup-card popup-fold" open>
        <summary><h2>이렇게 즐겨요</h2></summary>
        <ol className="popup-steps">
          {STEPS.map((step) => (
            <li key={step.no} className={step.tone}>
              <b>STEP {String(step.no).padStart(2, '0')}</b>
              <strong>{step.title}</strong>
              <span>{step.desc}</span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}
