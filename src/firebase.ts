import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * 교사 관리 파일: Firebase 연결.
 * 아래 설정값은 원래 웹사이트 코드에 공개로 들어가는 값입니다(비밀번호가 아님).
 * 데이터 보호는 firestore.rules(보안 규칙)와 운영진 로그인으로 합니다.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDg11sEojLQtuKmBmhLsWglMe7S8s43nT4',
  authDomain: 'school-festival-2026.firebaseapp.com',
  projectId: 'school-festival-2026',
  storageBucket: 'school-festival-2026.firebasestorage.app',
  messagingSenderId: '1006016153476',
  appId: '1:1006016153476:web:c9479420295360c115ffd1',
}

/** 운영진 계정(Firebase Authentication > 사용자). 실제 메일함이 아니라 계정 이름으로만 씁니다. 보안 규칙에도 같은 값이 있습니다. */
export const ADMIN_EMAIL = 'admin@school-festival-2026.firebaseapp.com'

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
