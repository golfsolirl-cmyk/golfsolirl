import { useCallback, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { cx } from '../../../lib/utils'

type CinematicRemoteImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  readonly remoteSrc: string
  readonly fallbackSrc: string
}

/**
 * Tries remote (Unsplash) first; swaps to bundled public asset on error so the hero never blanks.
 */
export function CinematicRemoteImage({
  remoteSrc,
  fallbackSrc,
  className,
  alt,
  onError,
  loading,
  fetchPriority,
  decoding,
  ...rest
}: CinematicRemoteImageProps) {
  const [src, setSrc] = useState(remoteSrc)

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      setSrc((current) => (current === fallbackSrc ? current : fallbackSrc))
      onError?.(e)
    },
    [fallbackSrc, onError]
  )

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      className={cx(className)}
      onError={handleError}
      {...rest}
    />
  )
}
