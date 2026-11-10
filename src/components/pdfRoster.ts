/**
 * 교사 관리 파일: 명렬표 PDF에서 글자를 꺼냅니다. 파일은 이 기기 브라우저 안에서만 읽고 어디로도 보내지 않습니다.
 * PDF 읽기 도구(pdfjs)는 크기가 커서, 운영진이 PDF를 고를 때만 불러옵니다.
 *
 * PDF마다 글자를 저장하는 방식이 달라서(한 글자씩 / 낱말 단위 / 칸 단위) 세 가지 방법으로 읽어 보고,
 * 학생이 가장 많이 나오는 방법을 씁니다(AdminRoster가 고름).
 */
export type Piece = { text: string; x: number; y: number; width: number; size: number; eol: boolean }

/** 같은 높이(y)의 조각을 한 줄로 모읍니다. */
function toRows(pieces: Piece[]): Piece[][] {
  const sorted = pieces.filter((piece) => piece.text.trim()).sort((a, b) => b.y - a.y || a.x - b.x)
  const rows: Piece[][] = []
  for (const piece of sorted) {
    const row = rows[rows.length - 1]
    if (row && Math.abs(row[0]!.y - piece.y) <= Math.max(2, piece.size * 0.4)) row.push(piece)
    else rows.push([piece])
  }
  return rows.map((row) => row.sort((a, b) => a.x - b.x))
}

/** 줄 안에서 앞 조각과 거의 붙어 있으면 이어 붙이고, 벌어져 있으면 띄웁니다. widthOf로 조각 너비를 정합니다. */
function joinRows(rows: Piece[][], widthOf: (piece: Piece) => number): string {
  return rows.map((row) => {
    let line = ''
    let end = -Infinity
    for (const piece of row) {
      if (line && piece.x - end > Math.max(1, piece.size * 0.35)) line += ' '
      line += piece.text
      end = piece.x + widthOf(piece)
    }
    return line
  }).join('\n')
}

/** 같은 PDF를 세 가지 방법으로 글자로 바꿉니다. */
export function piecesToTexts(pieces: Piece[]): string[] {
  const rows = toRows(pieces)
  return [
    // 1) 위치 + PDF가 알려 준 글자 너비
    joinRows(rows, (piece) => piece.width),
    // 2) 위치 + 글자 수로 어림한 너비(PDF 너비 값이 이상할 때)
    joinRows(rows, (piece) => piece.text.length * piece.size * 0.55),
    // 3) 저장된 순서대로 조각마다 띄어 쓰기(칸 단위로 저장된 PDF)
    pieces.map((piece) => piece.text + (piece.eol ? '\n' : ' ')).join(''),
  ]
}

export async function pdfToTexts(file: File): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages: string[][] = []
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const content = await (await pdf.getPage(number)).getTextContent()
    const pieces: Piece[] = []
    for (const item of content.items) {
      if (!('str' in item)) continue
      const [a, b, , , x, y] = item.transform as number[]
      pieces.push({ text: item.str, x: x!, y: y!, width: item.width, size: Math.hypot(a!, b!) || item.height || 10, eol: item.hasEOL })
    }
    pages.push(piecesToTexts(pieces))
  }
  await pdf.destroy()
  return [0, 1, 2].map((way) => pages.map((page) => page[way]!).join('\n'))
}

/** 화면 확인용: 한글(이름)을 ○로 가립니다. 숫자·띄어쓰기 모양만 보여서 이름이 드러나지 않습니다. */
export function maskNames(text: string, lines = 15): string {
  return text.split('\n').filter((line) => line.trim()).slice(0, lines).map((line) => line.replace(/[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z]/g, '○')).join('\n')
}
