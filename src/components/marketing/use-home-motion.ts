'use client';

import { useEffect, type RefObject } from 'react';

/** Keep decorative motion scoped to this page, with cleanup on route changes. */
export function useHomeMotion(
  ref: RefObject<HTMLDivElement | null>,
  paused: boolean
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const abort = new AbortController();
    const frames = new Set<number>();
    let scrollFrame = 0;
    const all = (selector: string) =>
      root.querySelectorAll<HTMLElement>(selector);
    const active = () => !paused && !reduced.matches;
    const raf = (callback: FrameRequestCallback) => {
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        callback(time);
      });
      frames.add(id);
      return id;
    };
    function paint() {
      scrollFrame = 0;
      all('.orb').forEach((el) => {
        el.style.transform = active()
          ? `translateY(${Math.min(scrollY, 1000) * Number(el.dataset.speed)}px)`
          : 'none';
      });
      const mockup = root!.querySelector<HTMLElement>('.mockup');
      const tilt = active() ? Math.max(0, 1 - scrollY / 650) : 0;
      if (mockup)
        mockup.style.transform = `rotateX(${7 * tilt}deg) rotateZ(${-tilt}deg)`;
    }
    function syncMotion() {
      root!.classList.toggle('motion', active());
      root!.classList.toggle('paused', !active());
      paint();
    }
    syncMotion();
    reduced.addEventListener('change', syncMotion, { signal: abort.signal });
    window.addEventListener(
      'scroll',
      () => {
        if (!scrollFrame) scrollFrame = raf(paint);
      },
      { passive: true, signal: abort.signal }
    );

    function count(el: HTMLElement) {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (!active()) {
        el.textContent = target + suffix;
        return;
      }
      el.setAttribute('aria-label', target + suffix);
      const start = performance.now();
      function tick(now: number) {
        const progress = Math.min((now - start) / 1100, 1);
        el.textContent =
          Math.round(target * (1 - (1 - progress) ** 3)) + suffix;
        if (progress < 1 && active()) raf(tick);
        else el.textContent = target + suffix;
      }
      raf(tick);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          entry.target
            .querySelectorAll<HTMLElement>('[data-count]')
            .forEach(count);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    all('.reveal').forEach((el, i) => {
      el.style.setProperty('--delay', `${(i % 3) * 75}ms`);
      observer.observe(el);
    });
    all('.card').forEach((card) => {
      card.addEventListener(
        'pointermove',
        (e) => {
          if (!active() || !fine.matches) return;
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        },
        { signal: abort.signal }
      );
    });
    all('.magnetic').forEach((button) => {
      button.addEventListener(
        'pointermove',
        (e) => {
          if (!active() || !fine.matches) return;
          const rect = button.getBoundingClientRect();
          button.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.1}px,${(e.clientY - rect.top - rect.height / 2) * 0.16}px)`;
        },
        { signal: abort.signal }
      );
      button.addEventListener(
        'pointerleave',
        () => {
          button.style.transform = '';
        },
        { signal: abort.signal }
      );
    });
    return () => {
      abort.abort();
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
      all('.magnetic, .orb, .mockup').forEach((el) => {
        el.style.transform = '';
      });
      all('[data-count]').forEach((el) => {
        el.textContent = (el.dataset.count || '') + (el.dataset.suffix || '');
      });
      root.classList.remove('motion', 'paused');
    };
  }, [ref, paused]);
}
