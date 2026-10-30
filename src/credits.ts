/**
 * 교사 관리 파일: 사이트 각 칸의 이름표("○○이 만든 기능")에 보일 이름.
 * 비워 두면 "N번 학생이 만든 기능"으로 나옵니다.
 * 주의: 사이트와 저장소가 공개라서 누구나 봅니다. 실명은 학생·보호자 동의가 있을 때만 쓰고,
 *       아니면 닉네임(예: '별빛여우')이나 '1번 개발자'처럼 실명이 아닌 이름을 쓰세요.
 */
export const CREDITS: Record<number, string> = {
  1: '',
  2: '',
  3: '',
  4: '',
  5: '',
  6: '',
  7: '',
  8: '',
}

/** 받침이 있으면 "이", 없으면 "가" (한글이 아닌 이름은 "이(가)") */
function subjectParticle(name: string): string {
  const last = name.charCodeAt(name.length - 1)
  if (last < 0xac00 || last > 0xd7a3) return '이(가)'
  return (last - 0xac00) % 28 === 0 ? '가' : '이'
}

/** 이름표 문구: "지민이 만든 기능" / "현우가 만드는 중" / 이름이 없으면 "3번 학생이 만든 기능" */
export function creditLabel(no: number, built: boolean): string {
  const name = CREDITS[no]?.trim()
  const who = name ? `${name}${subjectParticle(name)}` : `${no}번 학생이`
  return `${who} ${built ? '만든 기능' : '만드는 중'}`
}
