import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rgb } from 'pdf-lib'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const publicImagesDirectory = path.resolve(currentDirectory, '../public/images')

/** Bitmap logo + fleet hero — same assets as formal proposal PDFs and quote PDFs. */
export const brandedPdfAssetPaths = {
  logo: path.join(publicImagesDirectory, 'golfsol-header-logo-bitmap.png'),
  /** Airport-desk style fleet plate (PNG); replace file in `public/images` to refresh all PDFs/emails. */
  fleetLineup: path.join(publicImagesDirectory, 'gsol-airport-transfer-desk-hero.png')
}

/** PDF palette aligned with enquiry / proposal PDFs and transactional email shell. */
export const pdfEmailTheme = {
  green: rgb(6 / 255, 59 / 255, 42 / 255),
  greenSoft: rgb(15 / 255, 81 / 255, 60 / 255),
  gold: rgb(255 / 255, 199 / 255, 44 / 255),
  goldDeep: rgb(217 / 255, 154 / 255, 0),
  cream: rgb(247 / 255, 240 / 255, 226 / 255),
  sand: rgb(233 / 255, 217 / 255, 182 / 255),
  ink: rgb(22 / 255, 35 / 255, 29 / 255),
  muted: rgb(102 / 255, 115 / 255, 109 / 255),
  white: rgb(1, 1, 1),
  paleGreen: rgb(246 / 255, 251 / 255, 248 / 255),
  paleGold: rgb(255 / 255, 249 / 255, 234 / 255)
}

export const heroDescriptionColor = rgb(220 / 255, 232 / 255, 226 / 255)
