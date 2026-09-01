import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CarouselItem {
  id: number;
  src: string;
  bg: string;
  panel: string;
  alt: string;
}

const IMAGES: CarouselItem[] = [
  {
    id: 0,
    src: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85',
    bg: '#F4845F',
    panel: '#F79B7F',
    alt: 'Audio Gear',
  },
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
    bg: '#6BBF7A',
    panel: '#85CC92',
    alt: 'Tailored Apparel',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=85',
    bg: '#E882B4',
    panel: '#ED9DC4',
    alt: 'Power Gear',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
    alt: 'Charging Hub',
  },
];

type Role = 'center' | 'left' | 'right' | 'back';

export default function LenkaHero() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });

    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return;

      setIsAnimating(true);
      setActiveIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % IMAGES.length;
        }
        return (prev + 3) % IMAGES.length;
      });

      setTimeout(() => {
        setIsAnimating(false);
      }, 650);
    },
    [isAnimating]
  );

  const roles = useMemo(() => {
    const roleMap: Record<number, Role> = {};
    roleMap[activeIndex] = 'center';
    roleMap[(activeIndex + 3) % 4] = 'left';
    roleMap[(activeIndex + 1) % 4] = 'right';
    roleMap[(activeIndex + 2) % 4] = 'back';
    return roleMap;
  }, [activeIndex]);

  const getRoleStyles = (role: Role): React.CSSProperties => {
    switch (role) {
      case 'center':
        return {
          transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMobile ? '60%' : '92%',
          bottom: isMobile ? '22%' : '0%',
        };
      case 'left':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? '20%' : '30%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '32%' : '12%',
        };
      case 'right':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? '80%' : '70%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '32%' : '12%',
        };
      case 'back':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: 1,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '13%' : '22%',
          bottom: isMobile ? '32%' : '12%',
        };
    }
  };

  const activeTheme = IMAGES[activeIndex];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: activeTheme.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative w-full h-screen overflow-hidden">
        
        {/* Grain Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Top Brand Tag */}
        <div
          className="absolute top-6 left-4 sm:left-8 text-xs font-semibold uppercase text-white"
          style={{ zIndex: 60, opacity: 0.9, letterSpacing: '0.18em' }}
        >
          LENKA STORES
        </div>

        {/* Giant Ghost Text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: '18%' }}
        >
          <span
            className="font-anton uppercase text-white"
            style={{
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              opacity: 1,
            }}
          >
            LENKA
          </span>
        </div>

        {/* Carousel Layer */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {IMAGES.map((item, index) => {
            const role = roles[index];
            const roleStyle = getRoleStyles(role);

            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  aspectRatio: '0.6 / 1',
                  transition:
                    'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1), bottom 650ms cubic-bezier(0.4, 0, 0.2, 1), height 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, filter, opacity, left',
                  ...roleStyle,
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="w-full h-full object-contain object-bottom pointer-events-none drop-shadow-2xl"
                />
              </div>
            );
          })}
        </div>

        {/* Center Floating "GET STARTED" Button */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 70,
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="font-anton uppercase rounded-full px-10 py-4 sm:px-14 sm:py-5 bg-white cursor-pointer active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-105"
            style={{
              color: activeTheme.bg,
              letterSpacing: '0.05em',
              fontSize: 'clamp(16px, 2.5vw, 24px)',
            }}
          >
            GET STARTED
          </button>
        </div>

        {/* Bottom Left Navigation */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 text-white"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          <p
            className="font-bold uppercase mb-2 sm:mb-3 text-base sm:text-[22px]"
            style={{ opacity: 0.95, letterSpacing: '0.02em' }}
          >
            LENKA STORES
          </p>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ opacity: 0.85, lineHeight: 1.6 }}
          >
            Discover fashion and electronics curated for modern living. Premium quality,
            delivered with care. Explore the collection.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('prev')}
              disabled={isAnimating}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white transition-all duration-150 hover:scale-108 hover:bg-white/12 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('next')}
              disabled={isAnimating}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white transition-all duration-150 hover:scale-108 hover:bg-white/12 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Bottom Right Explore Action */}
        <div
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 text-white"
          style={{ zIndex: 60 }}
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 font-anton uppercase text-white transition-opacity duration-200 hover:opacity-100 cursor-pointer"
            style={{
              fontSize: 'clamp(20px, 4vw, 56px)',
              fontWeight: 400,
              opacity: 0.95,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            <span>EXPLORE</span>
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </button>
        </div>

      </div>
    </div>
  );
}
