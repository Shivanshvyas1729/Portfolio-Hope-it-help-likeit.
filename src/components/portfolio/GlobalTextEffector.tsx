import React, { useMemo } from 'react';
import { useCMSData } from '@/context/CMSContext';

/**
 * GlobalTextEffector
 * 
 * Injects global CSS styles to handle fluid text hover interactions.
 * FIXED: Specifically excludes .gradient-text elements from global resets 
 * that would break their clipping behavior (creating the "ugly background" bug).
 */
const GlobalTextEffector = () => {
  const settings = useCMSData(d => d.settings);

  const css = useMemo(() => {
    if (!settings) return "";

    const speed = settings.textTransitionSpeed || "0.6s";
    const animSpeed = settings.textAnimationSpeed || "3s";
    
    const hoverColors = settings.textHoverColors?.length 
      ? settings.textHoverColors 
      : (settings.ropeLightColors?.length ? settings.ropeLightColors : ["#6366f1"]);
    
    const glow = settings.textGlowIntensity || 0;
    const isGradient = hoverColors.length > 1;
    const primaryColor = hoverColors[0];

    // Styles for pure text (h1, p, span, etc.)
    let textHoverStyles = "";
    if (isGradient) {
      const gradient = `linear-gradient(135deg, ${hoverColors.join(', ')}, ${hoverColors[0]})`;
      textHoverStyles = `
        background-image: ${gradient} !important;
        background-size: 200% auto !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        color: transparent !important;
        animation: text-flow ${animSpeed} linear infinite !important;
        ${glow > 0 ? `filter: drop-shadow(0 0 ${glow * 2}px ${primaryColor}88) !important;` : ""}
      `;
    } else {
      textHoverStyles = `
        color: ${primaryColor} !important;
        -webkit-text-fill-color: ${primaryColor} !important;
        background-image: none !important;
        ${glow > 0 ? `text-shadow: 0 0 ${glow * 8}px ${primaryColor}88, 0 0 ${glow * 2}px ${primaryColor}88 !important;` : ""}
      `;
    }

    // Styles for container text (a, button)
    const linkHoverStyles = `
      color: ${primaryColor} !important;
      -webkit-text-fill-color: ${primaryColor} !important;
      background-clip: border-box !important;
      background-image: none !important;
    `;

    return `
      @keyframes text-flow {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }

      /* Base Style & Symmetrical Transition */
      h1, h2, h3, h4, h5, h6, p, span, a, li, b, i, strong, em, button {
        transition-property: color, text-shadow, filter, -webkit-text-fill-color, background-image, background-position;
        transition-duration: ${speed};
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        will-change: color, text-shadow, filter;
      }
      
      /* Global RESET - Only apply to elements NOT already marked as gradient-text */
      h1:not(.gradient-text), 
      h2:not(.gradient-text), 
      h3:not(.gradient-text), 
      h4:not(.gradient-text), 
      h5:not(.gradient-text), 
      h6:not(.gradient-text), 
      p:not(.gradient-text), 
      span:not(.gradient-text), 
      a:not(.gradient-text), 
      li:not(.gradient-text), 
      button:not(.gradient-text) {
        -webkit-text-fill-color: initial;
        background-clip: border-box;
      }
      
      /* Pure Text Hover Targets (Non-Gradient) */
      h1:not(.gradient-text):hover,
      h2:not(.gradient-text):hover,
      h3:not(.gradient-text):hover,
      h4:not(.gradient-text):hover,
      h5:not(.gradient-text):hover,
      h6:not(.gradient-text):hover,
      p:not(.gradient-text):hover,
      span:not(.gradient-text):hover,
      li:not(.gradient-text):hover,
      b:not(.gradient-text):hover,
      i:not(.gradient-text):hover,
      strong:not(.gradient-text):hover,
      em:not(.gradient-text):hover {
        ${textHoverStyles}
        transform: translateZ(0);
      }

      /* Link/Button Container Hover Targets (Non-Gradient) */
      a:not(.gradient-text):hover, a:not(.gradient-text):active,
      button:not(.gradient-text):hover, button:not(.gradient-text):active {
        ${linkHoverStyles}
        transform: translateZ(0);
      }

      /* Fix for Visited Links */
      a:visited {
        color: inherit;
      }

      /* Specialized Gradient Text Support (Ensures logo stays looking good) */
      .gradient-text {
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        background-image: var(--gradient-primary); /* Maintain default theme gradient */
      }
      
      .gradient-text:hover, .gradient-text:active {
        ${isGradient ? `background-image: linear-gradient(135deg, ${hoverColors.join(', ')}, ${hoverColors[0]}) !important;` : ""}
        animation: text-flow ${animSpeed} linear infinite !important;
        background-size: 200% auto !important;
      }
    `;
  }, [settings]);

  return (
    <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
  );
};

export default React.memo(GlobalTextEffector);
