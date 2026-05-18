import type { ReactNode } from 'react'

export type BusinessCardOrientation = 'portrait' | 'landscape'
export type BusinessCardSide = 'front' | 'back'
export type BusinessCardRenderMode = 'preview' | 'pdf'

export type BusinessCardSpec = {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly orientation: BusinessCardOrientation
  readonly side: BusinessCardSide
  readonly imageSrc: string
  readonly width: number
  readonly height: number
  readonly render: (mode?: BusinessCardRenderMode) => ReactNode
}
