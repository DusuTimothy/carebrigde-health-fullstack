import React, { useEffect, useState } from 'react';
import cn from '../../lib/cn.js';

/**
 * Decorative backdrop that crossfades through a list of images. Falls back to
 * the first image when the user prefers reduced motion. Images are preloaded so
 * each transition is smooth.
 */
export default function RotatingBg({ images, interval = 6000, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length < 2) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [images, interval]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      {images.map((src, i) => (
        <div
          key={src}
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out',
            i === index ? 'opacity-100' : 'opacity-0'
          )}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}
