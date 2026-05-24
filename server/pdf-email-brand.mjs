import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rgb } from 'pdf-lib'
import { GOLFSOL_BRAND_LOGO_SOURCE } from './brand-logo-assets.mjs'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const publicImagesDirectory = path.resolve(currentDirectory, '../public/images')

/** Bitmap logo + fleet hero — same assets as formal proposal PDFs and quote PDFs. */
export const brandedPdfAssetPaths = {
  /** Hosted logo for HTML email — same crest as site header/footer. */
  logoWeb: GOLFSOL_BRAND_LOGO_SOURCE,
  /** Transparent PNG deploy copy for pdf-lib (`embedPng`). Generated from crest source via sync script. */
  logo: path.join(publicImagesDirectory, 'gsirl.png'),
  homepageCrest: path.join(publicImagesDirectory, 'gsirl.png'),
  /** Airport-desk style fleet plate (PNG); replace file in `public/images` to refresh all PDFs/emails. */
  fleetLineup: path.join(publicImagesDirectory, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png')
}

/** PDF palette aligned with enquiry / proposal PDFs and transactional email shell. */
export const pdfEmailTheme = {
  green: rgb(6 / 255, 59 / 255, 42 / 255),
  greenSoft: rgb(15 / 255, 81 / 255, 60 / 255),
  gold: rgb(212 / 255, 168 / 255, 67 / 255),
  goldDeep: rgb(184 / 255, 146 / 255, 46 / 255),
  cream: rgb(238 / 255, 242 / 255, 239 / 255),
  sand: rgb(217 / 255, 217 / 255, 217 / 255),
  ink: rgb(22 / 255, 35 / 255, 29 / 255),
  muted: rgb(102 / 255, 115 / 255, 109 / 255),
  white: rgb(1, 1, 1),
  paleGreen: rgb(246 / 255, 251 / 255, 248 / 255),
  paleGold: rgb(227 / 255, 235 / 255, 230 / 255)
}

export const heroDescriptionColor = rgb(220 / 255, 232 / 255, 226 / 255)
