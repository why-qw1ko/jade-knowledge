'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  articleId?: number;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, paused, next]);

  if (banners.length === 0) return null;

  const getHref = (banner: Banner) => {
    if (banner.articleId) return `/articles/${banner.articleId}`;
    if (banner.linkUrl) return banner.linkUrl;
    return null;
  };

  const banner = banners[current];
  const href = getHref(banner);

  return (
    <section
      className="relative max-w-7xl mx-auto h-[400px] md:h-[480px] overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(banner.imageUrl)}
          alt={banner.title}
          className="w-full h-full object-cover transition-opacity duration-700"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div>
          {href ? (
            <Link href={href} className="inline-block">
              <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg hover:text-emerald-200 transition-colors">
                {banner.title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
              {banner.title}
            </h2>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
