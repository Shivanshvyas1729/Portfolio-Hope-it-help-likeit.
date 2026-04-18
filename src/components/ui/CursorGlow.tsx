import React, { useEffect, useRef } from 'react';

/**
 * CursorGlow component provides a soft, ambient glowing light that follows the cursor
 * with smooth delayed movement (lerp) for a premium, reactive feel.
 */
const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -1000, y: -1000 }); // Start far away to avoid initial flicker
  const targetPosition = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    // Listen for mouse movement across the entire window
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      // Lerp (Linear Interpolation) for smooth movement
      // Low value = smoother/slower delay
      const lerpFactor = 0.05;

      position.current.x += (targetPosition.current.x - position.current.x) * lerpFactor;
      position.current.y += (targetPosition.current.y - position.current.y) * lerpFactor;

      if (glowRef.current) {
        // Using translate3d for GPU acceleration
        glowRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '800px',
        height: '800px',
        pointerEvents: 'none',
        zIndex: -1, // Truly ambient background layer
        borderRadius: '100%',
        // Extra soft blue/purple gradient
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.02) 50%, transparent 80%)',
        filter: 'blur(100px)',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorGlow;
