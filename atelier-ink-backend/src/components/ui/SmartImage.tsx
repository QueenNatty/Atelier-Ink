'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface SmartImageProps extends Omit<ImageProps, 'src'> {
  local: string      // path inside /public e.g. "/images/artists/adaeze.jpg"
  fallback: string   // Unsplash URL used when local file doesn't exist
}

/**
 * SmartImage tries the local file first.
 * If it 404s (file not placed yet), it silently switches to the fallback URL.
 * This means the site always looks good — even before you've added your photos.
 */
export default function SmartImage({ local, fallback, alt, ...props }: SmartImageProps) {
  const [src, setSrc] = useState(local)

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => setSrc(fallback)}
      unoptimized
    />
  )
}
