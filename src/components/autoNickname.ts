/**
 * 교사 관리 파일: 랭킹에 올라갈 익명 닉네임을 자동으로 지어 줍니다(예: 배고픈고래).
 * 학생이 닉네임을 직접 쓰지 않으니 욕설·비하 닉네임이 랭킹 TV에 나올 일이 없습니다.
 * 누가 누구인지는 운영진 화면에서만 보입니다(닉네임 옆에 학번·이름).
 * 낱말을 바꾸거나 늘려도 됩니다. 두 낱말을 합쳐 12글자를 넘지 않게만 해 주세요.
 */
export const NICK_ADJECTIVES = [
  '반짝이는', '배고픈', '용감한', '졸린', '신나는', '수줍은', '느긋한', '씩씩한', '상큼한', '포근한',
  '엉뚱한', '다정한', '날쌘', '똑똑한', '행복한', '달콤한', '차분한', '명랑한', '든든한', '재빠른',
  '말랑한', '푸른', '빛나는', '단단한', '춤추는', '노래하는', '꿈꾸는', '웃는', '바삭한', '하늘색',
]

export const NICK_NOUNS = [
  '여우', '고래', '팝콘', '펭귄', '수달', '판다', '다람쥐', '고양이', '강아지', '부엉이',
  '돌고래', '해바라기', '도토리', '새싹', '구름', '별똥별', '무지개', '토끼', '거북이', '햄스터',
  '코알라', '참새', '나무늘보', '꿀벌', '반딧불', '젤리', '감자', '솜사탕', '북극곰', '사과',
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

/** 낱말 두 개를 골라 닉네임을 만듭니다. tries가 많아지면(겹치는 이름이 많으면) 뒤에 숫자를 붙입니다. */
export function randomNickname(tries = 0): string {
  const base = `${pick(NICK_ADJECTIVES)}${pick(NICK_NOUNS)}`
  return tries < 8 ? base : `${base}${Math.floor(Math.random() * 90) + 10}`
}

/** 아직 아무도 안 쓰는 닉네임을 찾습니다. avoid는 지금 내 닉네임(다시 뽑을 때 같은 이름이 안 나오게). */
export async function pickFreeNickname(isTaken: (nickname: string) => Promise<boolean>, avoid?: string): Promise<string | null> {
  for (let tries = 0; tries < 12; tries += 1) {
    const nickname = randomNickname(tries)
    if (nickname !== avoid && !(await isTaken(nickname))) return nickname
  }
  return null
}
