import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pdfPath =
  process.argv[2] ||
  'C:\\Users\\Top10\\Desktop\\الملف التعريفي عبدالمجيد الخضر لتأجير السيارات.pdf'
const outDir = path.join(__dirname, '..', 'public', 'profile')

fs.mkdirSync(outDir, { recursive: true })

const data = new Uint8Array(fs.readFileSync(pdfPath))
const pdf = await getDocument({ data, useSystemFonts: true }).promise

let count = 0

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum)
  const ops = await page.getOperatorList()

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== OPS.paintImageXObject && ops.fnArray[i] !== OPS.paintInlineImageXObject) {
      continue
    }

    const imgName = ops.argsArray[i][0]
    let img
    try {
      img = await page.objs.get(imgName)
    } catch {
      continue
    }
    if (!img?.data || img.width < 80 || img.height < 80) continue

    const rgba = img.data
    const { width, height } = img

    // Encode as PNG via BMP-like raw write — use JPEG for photos via simple PPM fallback
    const filename = `page-${String(pageNum).padStart(2, '0')}-img-${String(++count).padStart(3, '0')}.bmp`
    const filepath = path.join(outDir, filename)

    // Write raw RGBA as PNG using minimal encoder
    const png = encodePng(width, height, rgba)
    fs.writeFileSync(filepath, png)
    console.log(`Saved ${filename} (${width}x${height})`)
  }
}

console.log(`Done: ${count} images in ${outDir}`)

function encodePng(width, height, rgba) {
  // Use BMP as fallback — browsers support it; simpler than PNG encoder
  const rowSize = Math.ceil((width * 3) / 4) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 54 + pixelDataSize
  const buf = Buffer.alloc(fileSize)

  buf.write('BM')
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(54, 10)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(width, 18)
  buf.writeInt32LE(-height, 22) // top-down
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28)
  buf.writeUInt32LE(pixelDataSize, 34)

  let offset = 54
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      buf[offset++] = rgba[i + 2] // B
      buf[offset++] = rgba[i + 1] // G
      buf[offset++] = rgba[i] // R
    }
    const padding = rowSize - width * 3
    offset += padding
  }

  return buf
}