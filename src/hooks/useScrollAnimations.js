"use client";

import { useEffect, useRef, useState } from 'react';

// Hook para detectar quando elemento entra na viewport
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
}

// Hook para animações staggered (em sequência)
export function useStaggeredReveal(items = [], delay = 100) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const { ref, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (!hasIntersected) return;

    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
    });
  }, [hasIntersected, items, delay]);

  return {
    ref,
    isVisible: (index) => visibleItems.has(index),
    hasStarted: hasIntersected
  };
}

// Hook para scroll reveal com múltiplas opções
export function useScrollReveal(animationType = 'fadeUp', options = {}) {
  const { ref, hasIntersected } = useIntersectionObserver(options);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-700 ease-out';
    
    if (!hasIntersected) {
      switch (animationType) {
        case 'fadeUp':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'fadeDown':
          return `${baseClasses} opacity-0 -translate-y-8`;
        case 'fadeLeft':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'fadeRight':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'scale':
          return `${baseClasses} opacity-0 scale-95`;
        case 'rotate':
          return `${baseClasses} opacity-0 rotate-6 scale-95`;
        default:
          return `${baseClasses} opacity-0`;
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`;
  };

  return {
    ref,
    className: getAnimationClasses(),
    isVisible: hasIntersected
  };
}

// Componente wrapper para scroll reveal
export function ScrollReveal({ 
  children, 
  animation = 'fadeUp', 
  delay = 0, 
  className = '',
  ...props 
}) {
  const { ref, className: animationClasses } = useScrollReveal(animation);

  return (
    <div
      ref={ref}
      className={`${animationClasses} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        ...props.style 
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Componente para revelar lista de itens em sequência
export function StaggeredReveal({ 
  children, 
  staggerDelay = 100, 
  animation = 'fadeUp',
  className = '' 
}) {
  const items = Array.isArray(children) ? children : [children];
  const { ref, isVisible, hasStarted } = useStaggeredReveal(items, staggerDelay);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          delay={hasStarted ? index * staggerDelay : 0}
          className={isVisible(index) ? 'opacity-100' : 'opacity-0'}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

// Hook para parallax scrolling simples
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref,
    transform: `translateY(${offset}px)`
  };
}