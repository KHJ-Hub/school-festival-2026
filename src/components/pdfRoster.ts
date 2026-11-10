/**
 * 교사 관리 파일: 명렬표 PDF에서 글자를 꺼냅니다. 파일은 이 기기 브라우저 안에서만 읽고 어디로도 보내지 않습니다.
 * PDF 읽기 도구(pdfjs)는 크기가 커서, 운영진이 PDF를 고를 때만 불러옵니다.
 *
 * PDF는 글자를 한 글자씩 따로 저장하는 경우가 많아서("홍", "길", "동"), 글자 위치를 보고 다시 붙입니다.
 * - 높이(y)가 같은 글자끼리 한 줄로 모읍니다.
 * - 줄 안에서 왼쪽부터 놓고, 앞 글자와 거의 붙어 있으면 이어 붙이고 칸이 벌어져 있으면 띄웁니다.
 */
type Piece = { text: string; x: number; y: number; width: number; size: number }

export function piecesToText(pieces: Piece[]): string {
  const sorted = pieces.filter((piece) => piece.text.trim()).sort((a, b) => b.y - a.y || a.x - b.x)
  const rows: Piece[][] = []
  for (const piece of sorted) {
    const row = rows[rows.length - 1]
    if (row && Math.abs(row[0]!.y - piece.y) <= Math.max(2, piece.size * 0.4)) row.push(piece)
    else rows.push([piece])
  }
  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x)
    let line = ''
    let end = -Infinity
    for (const piece of row) {
      const gap = piece.x - end
      if (line && gap > Math.max(1, piece.size * 0.35)) line += ' '
      line += piece.text
      end = piece.x + piece.width
    }
    return line
  }).join('\n')
}

export async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages: string[] = []
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const content = await (await pdf.getPage(number)).getTextContent()
    const pieces: Piece[] = []
    for (const item of content.items) {
      if (!('str' in item)) continue
      const [a, b, , , x, y] = item.transform as number[]
      pieces.push({ text: item.str, x: x!, y: y!, width: item.width, size: Math.hypot(a!, b!) || item.height || 10 })
    }
    pages.push(piecesToText(pieces))
  }
  await pdf.destroy()
  return pages.join('\n')
}
