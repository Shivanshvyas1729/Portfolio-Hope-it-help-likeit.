import React, { useEffect, useRef } from 'react';
import { useCMSData } from '@/context/CMSContext';

/**
 * GlobalScrollReveal
 * 
 * Automatically detects text elements and applies a scroll-in animation
 * using Intersection Observer. Elements enter from different directions
 * (left, right, bottom) for a dynamic feel.
 */
const GlobalScrollReveal = () => {
  const data = useCMSData(d => d); // Re-run when CMS data changes
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 1. Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 2. Define the animation logic
    const setupAnimations = () => {
      // Find all text-heavy elements
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
      
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        
        // Skip elements that already animated or have specific exclusions
        if (htmlEl.dataset.revealInitialized) return;

        // Assign a direction based on element type or index
        let direction = 'bottom';
        if (htmlEl.tagName.startsWith('H')) {
          // Headers alternate left/right
          direction = index % 2 === 0 ? 'left' : 'right';
        } else if (htmlEl.tagName === 'LI') {
          // Lists usually come from bottom
          direction = 'bottom';
        } else {
          // Paragraphs alternate bottom/left/right
          const mods = ['bottom', 'left', 'right'];
          direction = mods[index % 3];
        }

        // Set initial state via styles to ensure it works even if CSS hasn't loaded
        htmlEl.style.opacity = '0';
        htmlEl.style.transition = 'none'; // Disable transition for initial positioning
        
        const offset = '40px';
        switch (direction) {
          case 'left': htmlEl.style.transform = `translateX(-${offset})`; break;
          case 'right': htmlEl.style.transform = `translateX(${offset})`; break;
          case 'bottom': htmlEl.style.transform = `translateY(${offset})`; break;
          case 'top': htmlEl.style.transform = `translateY(-${offset})`; break;
        }

        htmlEl.dataset.revealDirection = direction;
        htmlEl.dataset.revealInitialized = 'true';
      });

      // 3. Create Intersection Observer
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Apply a staggered delay based on vertical position or manual index
            // to make groups of elements feel natural
            const delay = 100; // base delay
            
            setTimeout(() => {
              target.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
              target.style.opacity = '1';
              target.style.transform = 'translate(0, 0)';
            }, delay);

            // Once animated, stop observing
            observerRef.current?.unobserve(target);
          }
        });
      }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters fully
      });

      // 4. Start observing
      elements.forEach(el => observerRef.current?.observe(el));
    };

    // Run setup after a short timeout to ensure DOM is ready
    const timer = setTimeout(setupAnimations, 100);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [data]); // Re-run when content changes (important for CMS)

  return null; // Side-effect only component
};

export default React.memo(GlobalScrollReveal);
