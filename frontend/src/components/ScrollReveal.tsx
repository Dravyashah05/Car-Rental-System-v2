import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('reveal-ready');

    const targets = Array.from(document.querySelectorAll('[data-animate]')) as HTMLElement[];
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    targets.forEach((element, index) => {
      const delay = element.dataset.delay ?? `${Math.min(index * 70, 350)}`;
      element.style.setProperty('--reveal-delay', `${delay}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
};

export default ScrollReveal;
