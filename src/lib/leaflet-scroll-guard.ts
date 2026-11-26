import type { Map as LeafletMap } from 'leaflet'

/**
 * Mobile page scroll must always win over Leaflet drag/zoom.
 * Maps stay inert until the visitor deliberately activates them
 * (tap the overlay, or two-finger gesture). Wheel zoom stays off.
 */
export type LeafletScrollGuardHandle = {
  readonly activate: () => void
  readonly deactivate: () => void
  readonly destroy: () => void
  readonly isActive: () => boolean
}

export function attachLeafletScrollGuard(
  map: LeafletMap,
  container: HTMLElement,
  options?: { readonly initiallyActive?: boolean }
): LeafletScrollGuardHandle {
  let active = Boolean(options?.initiallyActive)

  map.scrollWheelZoom.disable()
  map.boxZoom.disable()
  map.keyboard?.disable?.()

  const apply = () => {
    if (active) {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      container.classList.add('gsol-map-active')
      container.classList.remove('gsol-map-inert')
      container.style.touchAction = 'none'
    } else {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      container.classList.add('gsol-map-inert')
      container.classList.remove('gsol-map-active')
      container.style.touchAction = 'pan-y'
    }
  }

  const activate = () => {
    if (active) return
    active = true
    apply()
  }

  const deactivate = () => {
    if (!active) return
    active = false
    apply()
  }

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length >= 2) activate()
  }

  const onWheel = (event: WheelEvent) => {
    if (!active) return
    // Never capture wheel for page scroll — keep page scroll winning.
    event.stopPropagation()
    map.scrollWheelZoom.disable()
  }

  container.addEventListener('touchstart', onTouchStart, { passive: true })
  container.addEventListener('wheel', onWheel, { passive: true, capture: true })

  apply()

  return {
    activate,
    deactivate,
    destroy: () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('wheel', onWheel, true)
      container.classList.remove('gsol-map-inert', 'gsol-map-active')
      container.style.touchAction = ''
    },
    isActive: () => active
  }
}
