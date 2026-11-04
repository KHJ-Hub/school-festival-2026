/**
 * 교사 관리 파일: 명렬표 PDF에서 글자를 꺼냅니다. 파일은 이 기기 브라우저 안에서만 읽고 어디로도 보내지 않습니다.
 * PDF 읽기 도구(pdfjs)는 크기가 커서, 운영진이 PDF를 고를 때만 불러옵니다.
 */
export async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages: string[] = []
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const content = await (await pdf.getPage(number)).getTextContent()
    // 글자 조각 사이는 띄어쓰기로, 줄이 끝나는 곳은 줄바꿈으로 이어 붙입니다.
    pages.push(content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '')).join(''))
  }
  await pdf.destroy()
  return pages.join('\n')
}
