import sharp from 'sharp'

/** Treat near-black pixels as transparent so crest works on cream/green email + PDF surfaces. */
export const stripSolidBlackBackground = async (inputBuffer, threshold = 28) => {
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
}
