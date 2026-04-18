import React, { useMemo } from 'react';
import { portfolioData } from '@/data/portfolioData';
import { useTheme } from '@/hooks/useTheme';

const hexToRgba = (hex: string, opacity: number) => {
  if (!hex) return `rgba(255, 255, 255, ${opacity})`;
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const EdgeRopeLight = () => {
  const { theme } = useTheme();
  const settings = portfolioData.settings;

  const config = useMemo(() => {
    const resolvedTheme = theme === 'system' 
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    // Default colors based on current theme if multi-colors aren't provided
    const defaultColor = resolvedTheme === 'dark' 
      ? (settings?.ropeLightColorDark || "#7dd3fc")
      : (settings?.ropeLightColorLight || "#3b82f6");

    const colors = settings?.ropeLightColors && settings.ropeLightColors.length > 0
      ? settings.ropeLightColors
      : [defaultColor];

    return {
      colors,
      speed: settings?.ropeLightSpeed || 15,
      thickness: settings?.ropeLightThickness || 3,
      glow: settings?.ropeLightGlowIntensity || 5,
    };
  }, [theme, settings]);

  const gradientString = useMemo(() => {
    const mainColors = config.colors.map(c => c).join(', ');
    return `linear-gradient(to right, transparent, ${mainColors}, transparent)`;
  }, [config.colors]);

  const verticalGradientString = useMemo(() => {
    const mainColors = config.colors.map(c => c).join(', ');
    return `linear-gradient(to bottom, transparent, ${mainColors}, transparent)`;
  }, [config.colors]);

  return (
    <div className="fixed inset-0 w-full h-full z-[9999] pointer-events-none select-none overflow-hidden" aria-hidden="true">
      
      {/* ── BASE BLUR WASH ── */}
      <div 
        className="absolute inset-0 opacity-20 blur-[30px] mix-blend-screen"
        style={{ filter: `blur(${config.glow * 5}px)` }}
      >
        <div className="absolute top-0 w-full h-[60px] animate-ocean-h"
          style={{ background: gradientString, backgroundSize: '300% 100%', animationDuration: `${config.speed}s` }} />
        <div className="absolute bottom-0 w-full h-[60px] animate-ocean-h-rev"
          style={{ background: gradientString, backgroundSize: '300% 100%', animationDuration: `${config.speed * 1.2}s` }} />
      </div>

      {/* ── CORE ROPE LIGHTS ── */}
      <div className="absolute inset-0 z-10">
        {/* Top */}
        <div 
          className="absolute top-0 left-0 w-full animate-ocean-h"
          style={{ 
            height: `${config.thickness}px`, 
            background: gradientString, 
            backgroundSize: '250% 100%',
            animationDuration: `${config.speed}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.colors[0]}`
          }}
        />
        {/* Bottom */}
        <div 
          className="absolute bottom-0 left-0 w-full animate-ocean-h-rev"
          style={{ 
            height: `${config.thickness}px`, 
            background: gradientString, 
            backgroundSize: '250% 100%',
            animationDuration: `${config.speed * 1.1}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.colors[config.colors.length - 1]}`
          }}
        />
        {/* Left */}
        <div 
          className="absolute top-0 left-0 h-full animate-ocean-v-rev"
          style={{ 
            width: `${config.thickness}px`, 
            background: verticalGradientString, 
            backgroundSize: '100% 250%',
            animationDuration: `${config.speed * 1.3}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.colors[0]}`
          }}
        />
        {/* Right */}
        <div 
          className="absolute top-0 right-0 h-full animate-ocean-v"
          style={{ 
            width: `${config.thickness}px`, 
            background: verticalGradientString, 
            backgroundSize: '100% 250%',
            animationDuration: `${config.speed * 1.2}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.colors[config.colors.length - 1]}`
          }}
        />
      </div>

      <style>{`
        @keyframes ocean-h {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes ocean-h-rev {
          0% { background-position: 250% 0; }
          100% { background-position: -250% 0; }
        }
        @keyframes ocean-v {
          0% { background-position: 0 -250%; }
          100% { background-position: 0 250%; }
        }
        @keyframes ocean-v-rev {
          0% { background-position: 0 250%; }
          100% { background-position: 0 -250%; }
        }
        .animate-ocean-h { animation: ocean-h linear infinite; }
        .animate-ocean-h-rev { animation: ocean-h-rev linear infinite; }
        .animate-ocean-v { animation: ocean-v linear infinite; }
        .animate-ocean-v-rev { animation: ocean-v-rev linear infinite; }
      `}</style>
    </div>
  );
};

export default React.memo(EdgeRopeLight);

