import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Codespaces 브라우저 미리보기(*.app.github.dev)에서도 개발 서버가 열리도록 허용합니다.
  server: { host: true, allowedHosts: ['.app.github.dev'] },
})
